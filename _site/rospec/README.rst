rospec
======

.. image:: https://github.com/pcanelas/rospec/actions/workflows/flake8.yaml/badge.svg
    :target: https://github.com/pcanelas/rospec/actions/workflows/flake8.yaml
    :alt: flake8

.. image:: https://github.com/pcanelas/rospec/actions/workflows/pytest.yaml/badge.svg
    :target: https://github.com/pcanelas/rospec/actions/workflows/pytest.yaml
    :alt: pytest

Description
-----------

rospec is a domain specification language to specify configurations of ROS components and their integration.
Current approaches focus on runtime verification or require system execution to detect misconfigurations.
rospec allows component writer developers to express specifications for their ROS components, while component integrators
select their components and provide their configurations --- any mismatches are raised statically prior to execution.
By providing a formal way to describe the expected configuration and integration of ROS components, rospec helps identify
misconfigurations early in the development process, preventing costly errors during system execution.

The tool can be used to validate various aspects of ROS components configuration and integration, including but not only:

- Topic, service, and action connections between nodes;
- Parameter value constraints and dependencies;
- Component compatibility requirements.

Installation
-----------

rospec can be installed using either pip or by building from source. We recommend
using a virtual environment to avoid conflicts with other Python packages.

Prerequisites
~~~~~~~~~~~~

- `Python 3.9+ <https://www.python.org/downloads/>`_
- `Poetry (>=1.4.1) <https://python-poetry.org/>`_

Setup
~~~~~

The recommended way to install rospec is using Poetry within a virtual environment:

1. Clone the repository:

   .. code-block:: bash

      git clone https://github.com/pcanelas/rospec.git
      cd rospec

2. Install dependencies using Poetry:

   .. code-block:: bash

      poetry install

   This will install all dependencies, including development dependencies.

3. Activate the virtual environment:

   .. code-block:: bash

      poetry shell

Usage
-----

rospec offers a command line interface (CLI) for parsing and verifying specifications.
To run the CLI, you can use the following command:

.. code-block:: bash

   rospec --specifications path/to/your/spec.rospec

Basic Example
~~~~~~~~~~~~

Here's a simple example of a rospec specification containing the specification for one component and its integration:

.. code-block:: text

     node type move_group_type {
        param elbow_joint/max_acceleration: double where {_ >= 0};
        optional param elbow_joint/max_velocity: double = 2.0;
        optional param elbow_joint/has_velocity_limits: bool = false;
        optional param elbow_joint/has_acceleration_limits: bool = false;
    } where {
         exists(elbow_joint/max_acceleration) -> elbow_joint/has_acceleration_limits;
    }

    system {
        node instance move_group: move_group_type {
            param elbow_joint/max_acceleration = 0;
            param elbow_joint/max_velocity = 3.14;
            param elbow_joint/has_acceleration_limits = false;
            param elbow_joint/has_velocity_limits = false;
        }
    }

To verify this specification:

.. code-block:: bash

   rospec --specifications examples/evaluation/detectable-364801.rospec


Authors
-------

This project is a research project within the `Software and Societal Systems Department <https://s3d.cmu.edu/>`_ (S3D)
and the `Robotics Institute <https://www.ri.cmu.edu/>`_ at Carnegie Mellon University, and `LASIGE <https://lasige.pt/>`_
at University of Lisbon, by:

- `Paulo Canelas <https://pcanelas.com/>`_
- `Bradley Schmerl <https://www.cs.cmu.edu/~schmerl/>`_
- `Alcides Fonseca <https://wiki.alcidesfonseca.com/>`_
- `Christopher S. Timperley <https://chris.timperley.info/>`_

Acknowledgements
----------------

This work was supported by Fundação para a Ciência e Tecnologia (FCT) in the LASIGE Research Unit under the ref.
(UID/00408/2025 and EXPL/CCI-COM/1306/2021), and the CMU Portugal Dual PhD program (SFRH/BD/151469/2021).

Publications
------------

`The Usability Argument for ROS-based Robot Architectural Description Languages <https://acme.able.cs.cmu.edu/pubs/uploads/pdf/2024_plateau_rospecusabilityCanelas_RospecADL_2025.pdf>`_,
at PLATEAU 2025.

`Understanding Misconfigurations in ROS: An Empirical Study and Current Approaches <https://doi.org/10.1145/3650212.3680350/>`_,
at ISSTA 2024.
