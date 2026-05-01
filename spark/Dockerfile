# Use JDK 17 for a future-ready Spark 4.0 environment
FROM eclipse-temurin:17-jdk-jammy

LABEL maintainer="Koushik"
LABEL description="Next-Gen Spark 4.0 image for DELoc Education Lab"

# Set environment variables for Spark 4.0.0
ENV SPARK_VERSION=4.0.0
ENV HADOOP_VERSION=3
ENV SPARK_HOME=/opt/spark
ENV PATH=$PATH:$SPARK_HOME/bin:$SPARK_HOME/sbin

# Install dependencies and Python 3.13 via deadsnakes PPA
RUN apt-get update && apt-get install -y software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa \
    && apt-get update && apt-get install -y \
    procps \
    curl \
    python3.13 \
    python3.13-distutils \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.13 as the default python
RUN ln -sf /usr/bin/python3.13 /usr/bin/python3 && ln -sf /usr/bin/python3.13 /usr/bin/python

# Download and install Spark 4.0.0
RUN curl -sL https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION}.tgz | tar -xz -C /opt \
    && mv /opt/spark-${SPARK_VERSION}-bin-hadoop${HADOOP_VERSION} ${SPARK_HOME}

WORKDIR ${SPARK_HOME}

# Start spark-shell (Scala 2.13 is default in Spark 4.0)
CMD ["spark-shell"]
