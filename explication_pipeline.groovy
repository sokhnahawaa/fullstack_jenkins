pipeline {
    agent any
    // -> Indique que le pipeline peut s'exécuter sur **n'importe quel** agent Jenkins disponible.
    //    Attention : les commandes `docker` ici nécessitent que l'agent dispose du
    //    démon Docker (ou d'un socket Docker monté). Si Jenkins tourne dans un conteneur,
    //    il faut monter /var/run/docker.sock ou utiliser un agent avec Docker installé.

    environment {
        DOCKERHUB_CREDENTIALS = credentials('awahubid')
        // -> Liaison d'identifiants Jenkins (id = 'awahubid').
        //    Dans une pipeline déclarative, cela expose deux variables d'environnement :
        //      DOCKERHUB_CREDENTIALS_USR  (username)
        //      DOCKERHUB_CREDENTIALS_PSW  (password)
        //    On utilisera ces variables pour se connecter à Docker Hub sans exposer le mot de passe.
        //
        IMAGE_TAG = "v${BUILD_NUMBER}"
        // -> Tag des images Docker, basé sur le numéro du build (ex: "v15").
        //    Remarque : BUILD_NUMBER est fourni par Jenkins ; l'interpolation fonctionne
        //    habituellement ici mais on peut utiliser ${env.BUILD_NUMBER} pour être explicite.

        LASTEST_TAG = "latest"
        // -> Constante pour le tag "latest". (typo : on aurait plutôt voulu LATEST_TAG)
        //    Le nom est cohérent dans ton fichier, mais attention : "LASTEST" est une faute
        //    d'orthographe — mieux renommer en LATEST_TAG pour éviter la confusion.

        PORT = "5000"
        // -> Port utilisé par l'application (probablement dans docker-compose ou l'app). Dans
        //    ton pipeline ce n'est pas explicitement utilisé mais peut être utile si on
        //    injecte ces env vars dans docker-compose.

        MONGO_URI = "mongodb://mongodb:27017/smartphoneDB"
        // -> URL de connexion MongoDB. Encore une fois, elle est définie ici et peut être
        //    utilisée par docker-compose ou par tes containers via variables d'environnement.

        DELETE_CODE = "123"
        // -> Code arbitraire — attention à ne pas stocker de secrets sensibles en texte clair.
    }

    stages {
        stage('BUILD IMAGES DOCKER') {
            // -> Regroupe la construction des images Docker.
            parallel {
                // -> Exécute les sous-stages en parallèle (accélère la CI si agents/disques)
                stage('Build front') {
                    steps {
                        dir('front') {
                            // -> change le répertoire de travail dans workspace/front
                            sh "docker build . -t soxnahawaa/jenkins_front:${IMAGE_TAG} -t soxnahawaa/jenkins_front:latest"
                            // -> construit l'image Docker pour le front ici :
                            //    - contexte : '.' (dossier 'front')
                            //    - 2 tags : soxnahawaa/jenkins_front:${IMAGE_TAG} (ex: v15)
                            //                soxnahawaa/jenkins_front:latest
                            //    Remarque : la deuxième étiquette est littéralement 'latest' — tu pourrais
                            //    aussi utiliser le variable ${LASTEST_TAG}.
                            //
                            //    Important : l'agent doit pouvoir exécuter `docker build`.
                        }
                    }
                }

                stage('Build backend') {
                    steps {
                        dir('backend') {
                            sh "docker build . -t soxnahawaa/jenkins_backend:${IMAGE_TAG} -t soxnahawaa/jenkins_backend:latest"
                            // -> même principe pour le backend : deux tags.
                        }
                    }
                }
            }
        }

        stage('LOGIN TO DOCKER HUB') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                // -> connexion à Docker Hub en passant le mot de passe via stdin.
                //    Avantage : évite d'afficher le mot de passe dans les logs.
                //    Remarque : Jenkins masque automatiquement les valeurs de credentials dans les logs.
            }
        }

        stage('PUSH IMAGES') {
            steps {
                sh """
                    docker push soxnahawaa/jenkins_front:${IMAGE_TAG}
                    docker push soxnahawaa/jenkins_front:${LASTEST_TAG}
                    docker push soxnahawaa/jenkins_backend:${IMAGE_TAG}
                    docker push soxnahawaa/jenkins_backend:${LASTEST_TAG}
                """
                // -> Envoie (push) les 4 images vers Docker Hub :
                //    - front: tag de build + latest
                //    - backend: tag de build + latest
                //
                //    Remarque :
                //      * Le bloc triple-quote permet d'écrire plusieurs commandes shell.
                //      * Assure-toi que l'utilisateur Docker Hub a le droit de pousser
                //        sur le repository soxnahawaa/...
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d'
                // -> Déploie les services via docker-compose.
                //    - `docker compose down` arrête et supprime les containers/services du projet.
                //    - `docker compose up -d` démarre les services en arrière-plan.
                //
                //    Points à vérifier :
                //      * Le fichier docker-compose.yml doit être présent dans le répertoire où
                //        Jenkins exécute ces commandes (typiquement racine du workspace).
                //      * Si ton fichier compose est ailleurs, utiliser `-f chemin/docker-compose.yml`.
                //      * `docker compose` correspond à la v2 (commande intégrée). Si tu as docker-compose (v1),
                //        la commande serait `docker-compose up -d`.
            }
        }
    } // fin du bloc stages

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
            // -> Envoi d'un e-mail en cas de succès avec le plugin Email Extension (emailext).
            //    Assure-toi que la configuration SMTP de Jenkins est correcte.
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
            // -> Envoi d'un e-mail en cas d'échec.
        }

        always {
            sh 'docker logout || true'
            // -> Déconnexion de Docker Hub quoi qu'il arrive. "|| true" permet d'ignorer une
            //    erreur de logout pour ne pas faire échouer le post.
        }
    }
}
