# Kubernetes Learning Dashboard

An interactive, responsive client-side visual playground for learning Kubernetes architecture, object lifecycles, and CLI operations through visual nodes, YAML config editor, and structured challenge paths.

## Features

- **Interactive Cluster Map**: Visualizes the Kubernetes architecture in real-time, showing both the Control Plane (API Server, Scheduler, Controller Manager, etcd) and Worker Nodes running Pods.
- **Simulated CLI (kubectl)**: Run terminal commands like `kubectl get pods`, `kubectl describe`, `kubectl apply -f`, `kubectl scale`, and `kubectl delete` to manipulate the cluster layout instantly.
- **YAML Config Editor**: Edit manifest files with interactive autocomplete templates (Pod, Service, Deployment) and visual validation before applying.
- **Challenge Labs & Tutorials**: Progressive learning tracks from basic Pod structures to rolling updates and service routing, complete with interactive validation checks.
- **Visual Node & Pod Lifecycle**: Watch Pod statuses transition (Pending -> Running / Terminating) and pods scale dynamically with smooth animations.
- **Premium DevOps UI**: Modern dark terminal layout inspired by production cluster monitors, featuring glassmorphism cards and accessible semantics.

## Run it

Open `index.html` in any modern browser.

## What it shows

- Client-side visual state representation of distributed systems components.
- Live regex parser for a mock command-line interface.
- Complete client-side validation logic for YAML structure and challenge parameters.
- Local storage persistence for saving lesson and badge completion states.
- Clean semantic HTML structure, dynamic CSS layout grids, and animations.
