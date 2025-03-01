Install Service a

~~~ bash

curl -sL https://rpm.nodesource.com/setup_12.x | bash - 
sudo dnf install git vim nodejs -y 

git clone https://github.com/Carlos-ZRM/DO328-apps.git
cd DO328-apps/tracing-ge/servicea


npm install
npm install --save  jaeger-client@3.17.2 opentracing@0.14.4


~~~  

Install Service b

~~~ bash
export JAVA_OPTIONS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
export AB_ENABLED=jmx_exporter

git clone https://github.com/Carlos-ZRM/DO328-apps.git
cd DO328-apps/tracing-ge/serviceb


mvn clean package
java -jar target/serviceb-1.0.0-runner.jar
~~~

Expose VMI with servicea

~~~ bash

virtctl expose vmi servicea --port=8080  --target-port=8080 --type=ClusterIP --name servicea
virtctl expose vmi serviceb --port=8080  --target-port=8080 --type=ClusterIP --name serviceb

~~~

Expose Service with route

~~~ yaml

spec:
  to:
    kind: Service
    name: servicea
    weight: 100
  port:
    targetPort: 8080
  tls:
    termination: edge
  wildcardPolicy: None
---

~~~

~~~ bash

oc patch vm servicea --type merge --patch='{"spec": {"template": {"metadata": {"annotations": {"sidecar.istio.io/inject": "true"}}}}}'
oc patch vm serviceb --type merge --patch='{"spec": {"template": {"metadata": {"annotations": {"sidecar.istio.io/inject": "true"}}}}}'

virtctl restart servicea
virtctl restart serviceb
~~~

