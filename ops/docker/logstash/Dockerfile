FROM logstash
#FROM docker.elastic.co/logstash/logstash:5.3.2

COPY ops/docker/logstash/config/logstash.conf /usr/share/logstash/pipeline/logstash.conf

CMD ["-f", "/usr/share/logstash/pipeline/logstash.conf"]