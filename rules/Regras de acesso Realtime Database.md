<h1>Regras Firebase</h1>

# Padrão
{
  "rules": {
    ".read": "false",  
    ".write": "false",  
  }
}

# Testes
{
  "rules": {
    ".read": "true",  
    ".write": "true",  
  }
}

# Usuários autenticados podem fazer modificações no bd, regra não muito segura
{
  "rules": {
    ".read": "auth != null",  
    ".write":"auth != null",  
  }
}

# O usuário só poderá fazer modificações em seus próprios dados
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid == auth.uid",  
    		".write":"$uid == auth.uid",
      }
    }    
  }
}

# O usuário só poderá fazer modificações em seus próprios dados e há uma validação na inclusão de dados, limitando a uma String com 30 caracteres
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid == auth.uid",  
    		".write":"$uid == auth.uid",
      	"$tid" : {
          ".validate" : "newData.child('name').isString() && newData.child('name').val().length <=30"
        }
      }
    }    
  }
}

# incluido regras de validação Filtragem e ordenação de dados
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid == auth.uid",  
    		".write":"$uid == auth.uid",
          ".indexOn": "nameLowerCase",
      	"$tid" : {
          ".validate" : "newData.child('name').isString() && newData.child('name').val().length <=30 && newData.child('nameLowerCase').isString() && newData.child('nameLowerCase').val().length <=30" 
        }
      }
    }    
  }
}

