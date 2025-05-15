#!/usr/bin/env python3
"""
RoSpec Verification Server

This script sets up a simple HTTP server that accepts rospec code 
and verifies it using the rospec library.

Usage:
  python rospec_verification_server.py

Configuration:
  - PORT: The port to listen on (default: 8000)
"""

import os
import sys
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# Setup logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Configuration
PORT = 8000

# Add the rospec module to Python path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROSPEC_PATH = os.path.join(SCRIPT_DIR, "rospec")
sys.path.append(ROSPEC_PATH)
sys.path.append(os.path.join(ROSPEC_PATH, "src"))

# Import rospec modules
try:
    from src.rospec.language.frontend import parse_program
    from src.rospec.types_database.ttypes_loader import get_ros_types, get_native_types
    from src.rospec.verification.context import Context
    from src.rospec.verification.definition_formation import program_formation
    
    logger.info("Successfully imported rospec modules")
    ROSPEC_AVAILABLE = True
except ImportError as e:
    logger.error(f"Failed to import rospec modules: {str(e)}")
    ROSPEC_AVAILABLE = False


class RospecVerificationHandler(BaseHTTPRequestHandler):
    def _set_response_headers(self, status_code=200, content_type="text/plain"):
        self.send_response(status_code)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self._set_response_headers()

    def do_GET(self):
        """Handle GET requests - useful for testing if server is alive"""
        if self.path == "/api/verify-rospec" or self.path == "/api/status":
            self._set_response_headers()
            self.wfile.write("RoSpec verification server is running".encode())
        else:
            self._set_response_headers(404)
            self.wfile.write("Not found".encode())

    def do_POST(self):
        """Handle POST requests to verify rospec code"""
        content_length = int(self.headers.get("Content-Length", 0))
        
        # For path normalization
        parsed_path = urlparse(self.path).path
        
        # Process verification endpoint
        if parsed_path == "/api/verify-rospec":
            try:
                # Read request body
                post_data = self.rfile.read(content_length).decode("utf-8")
                
                # Parse JSON
                try:
                    json_data = json.loads(post_data)
                    rospec_code = json_data.get("code", "")
                except json.JSONDecodeError as e:
                    self._set_response_headers(400)
                    self.wfile.write(f"Invalid JSON data: {str(e)}".encode())
                    return
                
                if not rospec_code:
                    self._set_response_headers(400)
                    self.wfile.write("No code provided".encode())
                    return
                
                # Verify the rospec code
                verification_result = verify_rospec_code(rospec_code)
                
                # Send response
                self._set_response_headers()
                self.wfile.write(verification_result.encode())
                
            except Exception as e:
                self._set_response_headers(500)
                self.wfile.write(f"Server error: {str(e)}".encode())
        else:
            self._set_response_headers(404)
            self.wfile.write(f"Endpoint not found: {self.path}".encode())


def load_context() -> Context:
    """Load the rospec context with ROS types."""
    context = Context()
    context = get_ros_types(context)
    context = get_native_types(context)
    return context


def verify_rospec_code(code: str) -> str:
    """
    Verify rospec code using the rospec library
    
    Args:
        code (str): The rospec code to verify
        
    Returns:
        str: Error message if verification fails, empty string if successful
    """
    if not ROSPEC_AVAILABLE:
        return "RoSpec modules not available. Please check server configuration."
    
    try:
        # Parse the program
        parsed_program = parse_program(code)
        
        # Load context with ROS types
        context = load_context()
        
        # Verify the program
        errors = program_formation(context, parsed_program)
        
        if errors:
            return "\n".join(errors)
        else:
            return ""
    
    except Exception as e:
        return f"Verification error: {str(e)}"


def run_server():
    """Run the HTTP server"""
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, RospecVerificationHandler)
    print(f"Starting rospec verification server on port {PORT}...")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Server stopped by user")
    finally:
        httpd.server_close()
        print("Server closed")


if __name__ == "__main__":
    run_server()