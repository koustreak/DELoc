<template>
  <div :class="['inline-flex items-center justify-center flex-shrink-0 select-none', $attrs.class]">
    <!-- Official Authentic Vector Icons -->
    <img v-if="normalizedName === 'kafka'" :src="kafkaIcon" alt="Kafka" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'spark'" :src="sparkIcon" alt="Spark" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'airflow'" :src="airflowIcon" alt="Airflow" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'cassandra'" :src="cassandraIcon" alt="Cassandra" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'hdfs' || normalizedName === 'hadoop'" :src="hadoopIcon" alt="HDFS" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'trino'" :src="trinoIcon" alt="Trino" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'apache hive' || normalizedName === 'hive' || normalizedName === 'hive metastore'" :src="hiveIcon" alt="Hive" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'pinot'" :src="pinotIcon" alt="Pinot" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'minio'" :src="minioIcon" alt="MinIO" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'nifi'" :src="nifiIcon" alt="NiFi" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'postgresql' || normalizedName === 'postgres'" :src="postgresIcon" alt="PostgreSQL" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'mongodb' || normalizedName === 'mongo'" :src="mongodbIcon" alt="MongoDB" class="w-full h-full object-contain" />
    <img v-else-if="normalizedName === 'neo4j'" :src="neo4jIcon" alt="Neo4j" class="w-full h-full object-contain" />

    <!-- Apache Ozone -->
    <svg v-else-if="normalizedName === 'ozone'" viewBox="0 0 128 128" class="w-full h-full">
      <defs>
        <linearGradient id="ozoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0288D1"/>
          <stop offset="100%" stop-color="#01579B"/>
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r="52" fill="url(#ozoneGrad)"/>
      <path d="M42 46c0-10 8-18 18-18s18 8 18 18-8 18-18 18-18-8-18-18zm8 0c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10-10 4.5-10 10z" fill="#FFFFFF"/>
      <path d="M80 82c-4-4-4-10 0-14 4-4 10-4 14 0 4 4 4 10 0 14-4 4-10 4-14 0z" fill="#81D4FA"/>
      <path d="M60 82c-4-4-4-10 0-14 4-4 10-4 14 0 4 4 4 10 0 14-4 4-10 4-14 0z" fill="#81D4FA"/>
      <path d="M40 82c-4-4-4-10 0-14 4-4 10-4 14 0 4 4 4 10 0 14-4 4-10 4-14 0z" fill="#81D4FA"/>
    </svg>

    <!-- Generic Fallback Icon -->
    <svg v-else viewBox="0 0 24 24" class="w-full h-full text-slate-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/>
      <line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import kafkaIcon from '../../assets/icons/kafka.svg'
import sparkIcon from '../../assets/icons/spark.svg'
import airflowIcon from '../../assets/icons/airflow.svg'
import cassandraIcon from '../../assets/icons/cassandra.svg'
import hadoopIcon from '../../assets/icons/hadoop.svg'
import trinoIcon from '../../assets/icons/trino.svg'
import hiveIcon from '../../assets/icons/hive.svg'
import pinotIcon from '../../assets/icons/pinot.svg'
import minioIcon from '../../assets/icons/minio.svg'
import nifiIcon from '../../assets/icons/nifi.svg'
import postgresIcon from '../../assets/icons/postgres.svg'
import mongodbIcon from '../../assets/icons/mongodb.svg'
import neo4jIcon from '../../assets/icons/neo4j.svg'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const normalizedName = computed(() => {
  return (props.name || '').trim().toLowerCase()
})
</script>
