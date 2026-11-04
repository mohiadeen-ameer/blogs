> [!NOTE]
> This post is a draft outline. It stays hidden on the site until you remove `"draft": true` from `posts.json`.

## Why put Kafka between apps and OpenSearch?

<!-- The problem: logs get dropped under load. Kafka works as a buffer. -->

## What you need

<!-- kind or minikube, kubectl, helm, and Docker -->

## Step 1: Install the Strimzi operator

```terminal
$ kubectl create namespace kafka
$ kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka
```

## Step 2: Create a Kafka cluster and a topic

## Step 3: Send logs into the topic

## Step 4: Run a Data Prepper pipeline from Kafka to OpenSearch

```yaml
kafka-to-opensearch:
  source:
    kafka:
      bootstrap_servers: ["my-cluster-kafka-bootstrap.kafka:9092"]
      topics:
        - name: app-logs
          group_id: data-prepper
  sink:
    - opensearch:
        hosts: ["https://opensearch:9200"]
        index: app-logs-%{yyyy.MM.dd}
```

## Step 5: Search the logs in OpenSearch Dashboards

## Gotchas I hit

## Recap
