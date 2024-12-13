/* groovylint-disable-next-line CompileStatic */
pipeline {
  agent any
  environment {
        NVM_DIR = '/var/lib/jenkins/.nvm'
        GIT_SSH_COMMAND = "ssh -vvv -i ${env.JENKINS_HOME}/.ssh/id_ed25519"
  }
  stages {
    stage('Pull') {
      steps {
        sh '''
            cd /var/www/ng-attila-srv-v2
            git checkout main
            git reset --hard HEAD
            git pull
        '''
      }
    }
    stage('Install and build') {
      steps {
        sh """
            cd /var/www/ng-attila-srv-v2
            . ${NVM_DIR}/nvm.sh
            nvm use --silent 16.20.0
            npm install --legacy-peer-deps
            npm install -g pm2
            pm2 delete ng-attila-srv || true
            pm2 start app.js --name ng-attila-srv
            pm2 save
        """
      }
    }
  }
  post {
    always {
      cleanWs()
    }
  }
}
