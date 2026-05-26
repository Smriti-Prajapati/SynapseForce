# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/synapseforce-api.jar app.jar
EXPOSE 8081
ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=prod -Dserver.port=${PORT:-8081} -jar app.jar"]
