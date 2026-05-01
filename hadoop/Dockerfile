# Use JDK 17 for consistency with Spark 4.0
FROM eclipse-temurin:17-jdk-jammy

LABEL maintainer="Koushik"
LABEL description="Latest Hadoop 3.4.0 image for DELoc"

# Set environment variables
ENV HADOOP_VERSION=3.4.0
ENV HADOOP_HOME=/opt/hadoop
ENV HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
ENV PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ssh \
    rsync \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Download and install Hadoop 3.4.0
RUN curl -sL https://archive.apache.org/dist/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz | tar -xz -C /opt \
    && mv /opt/hadoop-${HADOOP_VERSION} ${HADOOP_HOME}

# Copy our custom configurations
COPY configs/core-site.xml $HADOOP_CONF_DIR/core-site.xml
COPY configs/hdfs-site.xml $HADOOP_CONF_DIR/hdfs-site.xml

# Configure SSH for passwordless localhost access
RUN ssh-keygen -t rsa -P '' -f ~/.ssh/id_rsa \
    && cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys \
    && chmod 0600 ~/.ssh/authorized_keys

# Set JAVA_HOME explicitly
RUN echo "export JAVA_HOME=/opt/java/openjdk" >> $HADOOP_CONF_DIR/hadoop-env.sh

# Format HDFS NameNode
RUN $HADOOP_HOME/bin/hdfs namenode -format

# Expose HDFS Web UI
EXPOSE 9870 9000

# Start SSH and HDFS on container launch
CMD service ssh start && start-dfs.sh && tail -f $HADOOP_HOME/logs/*
