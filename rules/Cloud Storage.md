# Padrão - Para usuários autenticados
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}

# Testes
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: true;
    }
  }
}

# Bloqueado 
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: false;
    }
  }
}

# Personalizado - Permite leitura, gravação e deleção, limitando a pasta de cada usuário através do uid e limita o recebimento de arquivo com tamanho menor do que 2mb
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /todoListFiles/{uid}/{allPaths=**} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid
      	&& request.resource.size <= 1024 * 1024 * 2
        && request.resource.contentType.matches('image/.*'); 
      allow delete: if request.auth.uid == uid;      
    }
  }
}