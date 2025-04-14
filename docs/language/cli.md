---
title: Command Line Interface
sidebar: home_sidebar
permalink: cli.html
parent: Language
summary: Learn how to use the ROSpec command line interface to verify and analyze ROS component configurations.
---

# ROSpec Command Line Interface

(Not working yet - coming soon)
{: .important }

The ROSpec command line interface (CLI) provides tools for verifying, analyzing, and managing specifications for ROS-based systems.

## Installation

The CLI is installed automatically when you install ROSpec:

```bash
pip install rospec
```

## Basic Commands

### Verify Command

The most common command is `verify`, which checks specifications for errors:

```bash
# Verify a single specification file
rospec verify myspec.rspec

# Verify all specification files in a directory
rospec verify path/to/specs/

# Verify and generate a detailed report
rospec verify myspec.rspec --report=report.json
```

### Syntax Check

To quickly check for syntax errors without performing full verification:

```bash
rospec syntax myspec.rspec
```

### Format Command

To format ROSpec files according to the standard style:

```bash
rospec format myspec.rspec

# Format all ROSpec files in a directory
rospec format path/to/specs/ --in-place
```

### Info Command

To get information about a specification file:

```bash
rospec info myspec.rspec
```

This provides a summary of the components, connections, and properties defined in the file.

## Command Options

### Common Options

These options work with most commands:

```
--verbose, -v       Increase output verbosity
--quiet, -q         Suppress non-essential output
--help, -h          Show help message
--version           Show version information
```

### Verify Options

```
--report=FILE       Generate a verification report in JSON format
--summary           Show only a summary of verification results
--fail-fast         Stop on the first error
--include-warnings  Treat warnings as errors
--ignore-warnings   Don't show warnings
--max-errors=N      Show at most N errors (default: 10)
```

### Format Options

```
--in-place, -i      Modify files in place
--check             Check if files are formatted correctly
--diff              Show diff of formatting changes
```

## Verification Reports

The `--report` option generates a detailed JSON report with information about verification results:

```json
{
  "verification_time": "2025-04-13T15:30:45",
  "rospec_version": "0.1.0",
  "files": [
    {
      "filename": "warehouse_robot.rspec",
      "status": "failed",
      "errors": [
        {
          "severity": "error",
          "message": "Parameter dependency violation in node 'controller'",
          "details": "Condition 'min_velocity < max_velocity' is not satisfied",
          "location": {
            "line": 42,
            "column": 3
          }
        },
        {
          "severity": "warning",
          "message": "Subscriber to topic '/scan' has no matching publisher",
          "location": {
            "line": 56,
            "column": 5
          }
        }
      ]
    }
  ],
  "summary": {
    "total_files": 1,
    "passed": 0,
    "failed": 1,
    "errors": 1,
    "warnings": 1
  }
}
```

## Exit Codes

The ROSpec CLI uses the following exit codes:

- `0`: Success (no errors)
- `1`: Verification errors found
- `2`: Command line or syntax errors
- `3`: File system errors (e.g., file not found)
- `4`: Internal errors

## Environment Variables

ROSpec behavior can be modified with environment variables:

- `ROSPEC_CONFIG`: Path to configuration file
- `ROSPEC_INCLUDE_PATH`: Additional directories to search for imported specifications
- `ROSPEC_LOG_LEVEL`: Set logging level (DEBUG, INFO, WARNING, ERROR)

## Configuration File

ROSpec can be configured with a `.rospec.yaml` file in the project directory:

```yaml
# .rospec.yaml
include_paths:
  - /path/to/specs
  - /another/path

verification:
  max_errors: 20
  include_warnings: true
  fail_fast: false

format:
  indent_size: 2
  max_line_length: 100
```

## Examples

### Basic Verification

```bash
# Verify a system specification
rospec verify warehouse_system.rspec

# Output might look like:
# Verifying warehouse_system.rspec...
# Error: Parameter dependency violation in node 'controller'
#   Condition 'min_velocity < max_velocity' is not satisfied
#   at warehouse_system.rspec:42:3
#
# Warning: Subscriber to topic '/scan' has no matching publisher
#   at warehouse_system.rspec:56:5
#
# Verification failed: 1 error, 1 warning
```

### Verifying Multiple Files

```bash
# Verify all ROSpec files in a directory
rospec verify path/to/specs/

# Output might look like:
# Verifying path/to/specs/node_types.rspec... OK
# Verifying path/to/specs/system.rspec... Failed (2 errors)
# Verifying path/to/specs/plugins.rspec... OK
#
# Verification failed: 2 errors in 1 file
```

### Generate and Export JSON Report

```bash
# Verify and generate a report
rospec verify warehouse_system.rspec --report=report.json

# The report can be used by other tools or CI/CD systems
```

### Check Formatting

```bash
# Check if files are formatted correctly
rospec format path/to/specs/ --check

# Output might look like:
# path/to/specs/node_types.rspec: OK
# path/to/specs/system.rspec: Would reformat
# path/to/specs/plugins.rspec: OK
#
# 1 file would be reformatted, 2 files would be left unchanged.
```

### Get Specification Information

```bash
# Get information about a specification
rospec info warehouse_system.rspec

# Output might look like:
# File: warehouse_system.rspec
#
# Node Types: 0
# Plugin Types: 0
# Node Instances: 5
# Plugin Instances: 3
#
# Connections:
#   Publishers: 12
#   Subscribers: 15
#   Service Providers: 3
#   Service Consumers: 3
#   Action Servers: 1
#   Action Clients: 1
#
# Parameters: 42
# TF Frames: 8
```

## Integration with Build Tools

### Make

```makefile
verify:
    rospec verify path/to/specs/

format:
    rospec format path/to/specs/ --in-place

check_format:
    rospec format path/to/specs/ --check
```

### CMake

```cmake
add_custom_target(verify
    COMMAND rospec verify ${CMAKE_SOURCE_DIR}/specs/
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    COMMENT "Verifying ROSpec specifications"
)
```

## Continuous Integration

### GitHub Actions

```yaml
name: ROSpec Verification

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install ROSpec
        run: pip install rospec
      - name: Verify specifications
        run: rospec verify path/to/specs/ --report=report.json
      - name: Upload verification report
        uses: actions/upload-artifact@v2
        with:
          name: rospec-verification-report
          path: report.json
```

The ROSpec CLI provides a powerful and flexible way to integrate configuration verification into your development workflow, helping you catch misconfigurations early and ensure system reliability.
