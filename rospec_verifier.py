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
ROSPEC_PATH = os.path.join(SCRIPT_DIR, "..", "rospec")
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
        # More permissive CORS headers
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Max-Age", "86400")
        self.end_headers()

    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        logger.info(f"OPTIONS request from {self.client_address[0]} for {self.path}")
        self._set_response_headers()

    def do_GET(self):
        """Handle GET requests - useful for testing if server is alive"""
        logger.info(f"GET request from {self.client_address[0]} for {self.path}")

        if self.path == "/api/verify-rospec" or self.path == "/api/status":
            self._set_response_headers()
            response_message = "RoSpec verification server is running"
            logger.info(f"Sending response: {response_message}")
            self.wfile.write(response_message.encode())
        else:
            self._set_response_headers(404)
            error_message = f"Not found: {self.path}"
            logger.warning(error_message)
            self.wfile.write(error_message.encode())

    def do_POST(self):
        """Handle POST requests to verify rospec code"""
        logger.info(f"POST request from {self.client_address[0]} for {self.path}")

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            logger.info(f"Content length: {content_length}")

            # For path normalization
            parsed_path = urlparse(self.path).path
            logger.info(f"Parsed path: {parsed_path}")

            # Process verification endpoint
            if parsed_path == "/api/verify-rospec":
                try:
                    # Read request body
                    post_data = self.rfile.read(content_length).decode("utf-8")
                    logger.info(f"Received data: {post_data[:100]}...")

                    # Parse JSON
                    try:
                        json_data = json.loads(post_data)
                        rospec_code = json_data.get("code", "")
                        logger.info(f"Extracted code length: {len(rospec_code)}")
                    except json.JSONDecodeError as e:
                        logger.error(f"JSON decode error: {str(e)}")
                        self._set_response_headers(400)
                        self.wfile.write(f"Invalid JSON data: {str(e)}".encode())
                        return

                    if not rospec_code:
                        logger.warning("No code provided in request")
                        self._set_response_headers(400)
                        self.wfile.write("No code provided".encode())
                        return

                    # Verify the rospec code
                    logger.info("Starting verification...")
                    verification_result = verify_rospec_code(rospec_code)
                    logger.info(f"Verification result: {verification_result[:100]}...")

                    # Send response
                    self._set_response_headers()
                    self.wfile.write(verification_result.encode())

                except Exception as e:
                    logger.error(f"Error processing request: {str(e)}")
                    self._set_response_headers(500)
                    self.wfile.write(f"Server error: {str(e)}".encode())
            else:
                logger.warning(f"Endpoint not found: {self.path}")
                self._set_response_headers(404)
                self.wfile.write(f"Endpoint not found: {self.path}".encode())
        except Exception as e:
            logger.error(f"Unexpected error in POST handler: {str(e)}")
            self._set_response_headers(500)
            self.wfile.write(f"Unexpected server error: {str(e)}".encode())


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
        logger.info("Parsing program...")
        # Parse the program
        parsed_program = parse_program(code)

        logger.info("Loading context...")
        # Load context with ROS types
        context = load_context()

        logger.info("Running verification...")
        # Verify the program
        errors = program_formation(context, parsed_program)

        if errors:
            logger.info(f"Verification failed with {len(errors)} errors")
            return "\n".join(errors)
        else:
            logger.info("Verification successful")
            return ""

    except Exception as e:
        logger.error(f"Verification exception: {str(e)}")
        return f"Verification error: {str(e)}"


def run_server():
    """Run the HTTP server"""
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, RospecVerificationHandler)
    print(f"Starting rospec verification server on port {PORT}...")
    print(f"Server accessible at http://0.0.0.0:{PORT}")
    print(f"Test with: curl http://localhost:{PORT}/api/status")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Server stopped by user")
    finally:
        httpd.server_close()
        print("Server closed")


if __name__ == "__main__":
    run_server()