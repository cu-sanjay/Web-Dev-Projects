# Docker Learning Simulator

An interactive, client-side educational playground (brand name **DockerSim**) designed to teach developers containerization concepts in a gamified environment. Users write Dockerfiles, configure port mappings, inject database variables, and run command-line actions inside a simulated terminal console, seeing the results rendered in real time on a live host architecture map.

## 🚀 Features

- **5 Guided Curriculum Levels**:
  - **Level 1 (First Container)**: Pull and run basic images (`docker run hello-world`).
  - **Level 2 (Port Mapping)**: Bind host network ports to web container services in detached mode (`docker run -d -p 8080:80 --name web-server nginx`).
  - **Level 3 (Environment Envs)**: Pass secret environment variables to configure database servers (`docker run -d -e POSTGRES_PASSWORD=secret --name db postgres`).
  - **Level 4 (Volume Mounts)**: Attach host volume directories to store persistent logs and db files (`docker run -d -v data_store:/data --name storage redis`).
  - **Level 5 (Custom Images)**: Write a custom Node.js `Dockerfile`, build it into a local container image (`docker build -t node-app .`), and run it with a port tunnel (`docker run -d -p 3000:3000 node-app`).
- **Retro CLI Simulator Terminal**: A command-line prompt executing mock Docker actions, complete with tab-autocompletion suggestions and a recall history query cache (Up/Down arrow keys).
- **Host Architecture Diagram Visualizer**: Live CSS/SVG schematic rendering running container cells, mapping dynamic network bridge channels, illustrating folder volumes, and tracking the local image registry.
- **Dockerfile Editor Workspace**: Editor panel to practice writing Docker build directives (`FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `CMD`) with built-in parameter hints.
- **Mock Browser Viewport**: Browser wrapper to test web servers mapped to host ports (e.g. loading `http://localhost:8080` renders Nginx welcome layouts; loading `http://localhost:3000` fetches custom Node app index coordinates).

## 📂 Project Structure

```
Docker Learning Simulator/
├── README.md         # Documentation manual
├── project.json      # Metadata workspace entry
├── index.html        # App interface markup
├── style.css         # Visual designs and layouts stylesheet
├── script.js         # Docker engine state machine and terminal parser
└── thumbnail.svg     # Branding SVG design
```

## 🛠️ How to Run

1. Open `index.html` in any web browser.
2. Select a Lesson checkpoint from the Left Sidebar.
3. Read instructions and parameters inside the curriculum guidelines.
4. Input instructions in the terminal console (e.g., `docker run --help` for commands support) and hit Enter.
5. Watch the Right sidebar update visually with your running containers. Test servers by clicking **Browser Preview** links.
