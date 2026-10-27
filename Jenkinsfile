pipeline {
    agent any

    triggers {
        // Triggered automatically on GitHub webhook push
        githubPush()
        // Fallback: poll Git every 5 minutes if webhook is behind a firewall
        pollSCM('H/5 * * * *')
    }

    environment {
        DOCKER_BUILDKIT = '1'
        MAVEN_OPTS = '-Xmx384m'
    }

    stages {
        stage('Checkout Source') {
            steps {
                echo '=== Step 1: Checking out latest code from GitHub ==='
                checkout scm
            }
        }

        stage('Compile & Run Unit Tests') {
            steps {
                echo '=== Step 2: Running Unit Tests for all Microservices ==='
                sh 'mvn test --batch-mode -DforkCount=1 -DargLine="-Xmx128m"'
            }
            post {
                always {
                    // Collect and display JUnit test reports in Jenkins UI
                    junit testResults: '**/target/surefire-reports/*.xml', allowEmptyResults: true
                }
            }
        }

        stage('Package Services') {
            steps {
                echo '=== Step 3: Packaging JAR artifacts ==='
                sh 'mvn package -DskipTests --batch-mode'
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '=== Step 4: Building Microservices Docker Images ==='
                sh '''
                    echo "Building Eureka Server image..."
                    docker build -t movieticket/eureka-server:latest ./eureka-server

                    echo "Building API Gateway image..."
                    docker build -t movieticket/api-gateway:latest ./api-gateway

                    echo "Building User Service image..."
                    docker build -t movieticket/user-service:latest ./user-service

                    echo "Building Movie Service image..."
                    docker build -t movieticket/movie-service:latest ./movie-service

                    echo "Building Theatre Service image..."
                    docker build -t movieticket/theatre-service:latest ./theatre-service

                    echo "Building Booking Service image..."
                    docker build -t movieticket/booking-service:latest ./booking-service

                    echo "Building Payment Service image..."
                    docker build -t movieticket/payment-service:latest ./payment-service

                    echo "Building Notification Service image..."
                    docker build -t movieticket/notification-service:latest ./notification-service

                    echo "Building Review Service image..."
                    docker build -t movieticket/review-service:latest ./review-service

                    echo "Building Analytics Service image..."
                    docker build -t movieticket/analytics-service:latest ./analytics-service

                    echo "All Docker images built successfully!"
                '''
            }
        }
    }

    post {
        success {
            echo "=========================================================="
            echo "🎉 Pipeline Build Succeeded! All tests passed and images built."
            echo "=========================================================="
        }
        failure {
            echo "=========================================================="
            echo "❌ Pipeline Build Failed! Check test logs and console output."
            echo "=========================================================="
        }
    }
}
