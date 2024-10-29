pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = 'my-node-app' // Replace with your Docker image name
        DOCKER_TAG = 'latest'
        DOCKER_HUB_USERNAME = 'your-docker-username' // Replace with your Docker Hub username
        DOCKER_HUB_CREDENTIALS_ID = 'docker-hub' // Jenkins credentials ID for Docker Hub
    }

    stages {
        stage('Checkout') {
            steps {
                // This step will automatically checkout the code from the GitHub repository
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Builds the Docker image using the Dockerfile present in the repo
                    docker.build("${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    // Logs in to Docker Hub and pushes the image
                    docker.withRegistry('https://registry.hub.docker.com', "${DOCKER_HUB_CREDENTIALS_ID}") {
                        def image = docker.image("${DOCKER_HUB_USERNAME}/${DOCKER_IMAGE_NAME}:${DOCKER_TAG}")
                        image.push()
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Docker image built and pushed successfully!'
        }
        failure {
            echo 'There was an error building or pushing the Docker image.'
        }
    }
}
