# DELoc

**DELoc** is an open-source local data engineering toolkit designed to help you build, manage, and experiment with high-performance data pipelines on your own machine. DELoc provides a unified UI and bundles all major big data tools in a single, easy-to-use Docker-based environment.

## Features

- 🚀 **All-in-One Toolkit:** Includes Apache Spark, HDFS, MinIO, HBase, Hive, Flume, NiFi, Kafka, Flink, Storm, Beam, Airflow, Superset, Grafana, PostgreSQL, MongoDB, and many more.
- 🖥️ **Unified UI:** Manage and monitor all services from a single web interface.
- 🐳 **Docker-Powered:** Instantly spin up a complete data engineering stack using Docker Compose. Each tool runs in its own container for isolation and flexibility.
- 🛠️ **Local Development:** Perfect for learning, prototyping, and testing big data solutions without the need for cloud resources.
- 🧩 **Extensible:** Easily add or remove services as your workflow evolves.

## Quick Start

1. **Clone the Repository**
   ```sh
   git clone https://github.com/yourusername/DELoc.git
   cd DELoc
   ```

2. **Start the Environment**
   ```sh
   docker compose up -d
   ```

3. **Access the UI**
   - Open your browser and go to [http://localhost:8080](http://localhost:8080) (default port).

4. **Stop the Environment**
   ```sh
   docker compose down
   ```

## Included Tools

- **Data Processing:** Spark, Flink, Storm, Beam
- **Storage:** HDFS, MinIO, HBase, PostgreSQL, MongoDB
- **Data Integration:** NiFi, Flume, Kafka
- **Data Warehousing:** Hive
- **Orchestration:** Airflow
- **Visualization:** Superset, Grafana

> _See the [docker-compose.yml](docker-compose.yml) for the full list of services and configuration._

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please open issues or submit pull requests to help improve DELoc.

## Acknowledgements

DELoc leverages the power of open-source big data tools and the Docker ecosystem.
```
