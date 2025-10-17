pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('awahubid')
        IMAGE_TAG = "v${BUILD_NUMBER}"
        LASTEST_TAG = "latest"
        PORT = "5000"
        MONGO_URI = "mongodb://mongodb:27017/smartphoneDB"
        DELETE_CODE = "123"
        // 🧩 Chemin vers le kubeconfig de ton compte Windows (ton profil utilisateur)
        KUBECONFIG = "C:\\Users\\HP\\.kube\\config"
    }

    stages {

        // stage('Analyse SonarQube' {
        //     agent {
        //         docker {
        //             image 'sonarsource/sonar-scanner-cli:latest'
        //             // On connecte le conteneur du scanner au réseau de Jenkins/SonarQube
        //             args '--network jenkins-docker_default -v /var/run/docker.sock:/var/run/docker.sock'
        //         }
        //     }
        //     steps {
        //         withSonarQubeEnv('sonarqube') { // nom du serveur SonarQube configuré dans Jenkins
        //             withCredentials([string(credentialsId: 'awasonarid', variable: 'SONAR_TOKEN')]) {
        //                 bat '''
        //                     sonar-scanner \
        //                         -Dsonar.projectKey=Depot_Jenkins \
        //                         -Dsonar.sources=. \
        //                         -Dsonar.host.url=http://sonarqube:9000 \
        //                         -Dsonar.login=$SONAR_TOKEN
        //                 '''
        //             }
        //         }
        //     }
        // }

        

        stage('BUILD IMAGES DOCKER') {
            parallel {
                stage('Build front') {
                    steps {
                        dir('front') {
                            bat "docker build . -t soxnahawaa/jenkins_front:${IMAGE_TAG} -t soxnahawaa/jenkins_front:${LASTEST_TAG}"
                        }
                    }
                }

                stage('Build backend') {
                    steps {
                        dir('backend') {
                            bat "docker build . -t soxnahawaa/jenkins_backend:${IMAGE_TAG} -t soxnahawaa/jenkins_backend:${LASTEST_TAG}"
                        }
                    }
                }
            }
        }

      stage('LOGIN TO DOCKER HUB') {
    steps {
        bat 'echo %DOCKERHUB_CREDENTIALS_PSW% | docker login -u %DOCKERHUB_CREDENTIALS_USR% --password-stdin'
      }
     }



        stage('PUSH IMAGES') {
            steps {
                bat """
                    docker push soxnahawaa/jenkins_front:${IMAGE_TAG}
                    docker push soxnahawaa/jenkins_front:${LASTEST_TAG}
                    docker push soxnahawaa/jenkins_backend:${IMAGE_TAG}
                    docker push soxnahawaa/jenkins_backend:${LASTEST_TAG}
                """
            }
        }

        // stage('Deploy') {
        //     steps {
        //         bat 'docker compose down'
        //         bat 'docker compose up -d'
        //     }
        // }

        
        

               stage('Deploy to Kubernetes') {
            steps {
                // 🔑 on s’assure d’utiliser ton kubeconfig utilisateur
                withEnv(["KUBECONFIG=${env.KUBECONFIG}"]) {
                    bat """
                    REM ✅ Vérifier l’accès au cluster
                    kubectl config view
                    kubectl get nodes

                    REM ✅ Démarrer Minikube s’il n’est pas déjà actif
                    minikube status || minikube start

                    REM ✅ Déploiement MongoDB
                    kubectl apply -f k8s/mongo-deployment.yaml
                    kubectl apply -f k8s/mongo-service.yaml

                    REM ✅ Déploiement backend
                    kubectl apply -f k8s/back-deployment.yaml
                    kubectl apply -f k8s/back-service.yaml

                    REM ✅ Déploiement frontend
                    kubectl apply -f k8s/front-deployment.yaml
                    kubectl apply -f k8s/front-service.yaml

                    REM ✅ Vérifier que tout tourne
                    kubectl get pods -A
                    """
                }
            }
        }

    }

    post {
        success {
            emailext(
                subject: "BUILD REUSSI - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<html>
                            <body>
                                <p>Bonjour,</p>
                                <p>Le job <b>${env.JOB_NAME}</b> (build #${env.BUILD_NUMBER}) a été exécuté avec succès.</p>
                                <p>Consultez les logs ici : <a href=\"${env.BUILD_URL}\">${env.BUILD_URL}</a></p>
                            </body>
                         </html>""",
                to: 'dangawa2000@gmail.com',
                from: 'dangawa2000@gmail.com',
                replyTo: 'dangawa2000@gmail.com',
                mimeType: 'text/html'
            )
        }

        failure {
            emailext(
                subject: "BUILD ECHOUE - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<html>
                            <body>
                                <p>Bonjour,</p>
                                <p>Le job <b>${env.JOB_NAME}</b> (build #${env.BUILD_NUMBER}) a échoué.</p>
                                <p>Consultez les logs ici : <a href=\"${env.BUILD_URL}\">${env.BUILD_URL}</a></p>
                            </body>
                         </html>""",
                to: 'dangawa2000@gmail.com',
                from: 'dangawa2000@gmail.com',
                replyTo: 'dangawa2000@gmail.com',
                mimeType: 'text/html'
            )
        }

        always {
            bat 'docker logout || true'
        }
    }
}
