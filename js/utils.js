//Definindo referências para elementos da pagina
var authForm = document.getElementById('authForm')
var authFormTitle = document.getElementById('authFormTitle')
var register = document.getElementById('register')
var access = document.getElementById('access')
var loading = document.getElementById('loading')
var auth = document.getElementById('auth')
var userContent = document.getElementById('userContent')
var userEmail = document.getElementById('userEmail')
var sendEmailVerificationDiv = document.getElementById('sendEmailVerificationDiv')
var emailVerified = document.getElementById('emailVerified')
var passwordReset = document.getElementById('passwordReset')
var userName = document.getElementById('userName')
var userImg = document.getElementById('userImg')

//REferências para a página do app
var todoForm = document.getElementById('todoForm')
var todoCount = document.getElementById('todoCount')
var ulTodoList = document.getElementById('ulTodoList')

var search = document.getElementById('search')

var progressFeedback = document.getElementById('progressFeedback')
var progress = document.getElementById('progress')
var playPauseBtn = document.getElementById('playPauseBtn')

var cancelBtn = document.getElementById('cancelBtn')

var cancelUpdateTodo = document.getElementById('cancelUpdateTodo')
var todoFormTitle = document.getElementById('todoFormTitle')


//Alterar formulário de autenticação para o cadastro de novas contas 
function toggleToRegister() {
    authForm.submitAuthForm.innerHTML = 'Cadastrar conta'
    authFormTitle.innerHTML = 'Insira os seus dados para se cadatrar'
    hideItem(register) //Esconder atalho para cadastrar conta
    hideItem(passwordReset)
    showItem(access) //Mostrar atalho para acessar conta
}

//Alterrar o formulário de autenticação para o acesso de contas já existentes
function toggleToAccess() {
    authForm.submitAuthForm.innerHTML = 'Acessar'
    authFormTitle.innerHTML = 'Acessar a sua conta para continuar'
    hideItem(access) //Esconder atalho para acessar conta
    showItem(register) //Mostrar atalho para cadastrar conta
    showItem(passwordReset)
}
//Simplifica a exibição de elementos da página
function showItem(element) {
    element.style.display = 'block'    
}

//Simplifica a remoção de elementos da página
function hideItem(element) {
    element.style.display = 'none'    
}

/**************************
****USUÁRIO AUTENTICADO****
**************************/ 
//Mostra o conteúdo do usuário autenticado
function showUserContent(user) {
    console.log(user)
    if (user.providerData[0].providerId != 'password') {
        emailVerified.innerHTML = 'Autenticação por provedor confiável, não é necessário verificar e-mail'
        hideItem(sendEmailVerificationDiv)
    } else {
        if (user.emailVerified) {
            emailVerified.innerHTML = 'E-mail verificado'
            hideItem(sendEmailVerificationDiv)
        } else {
            emailVerified.innerHTML = 'E-mail não verificado, você só poderá adicionar 5 tarefas<br>Verifique seu e-mail para aumentar o número de tarefas'
            showItem(sendEmailVerificationDiv)
        }
    }
    
    userImg.src = user.photoURL ? user.photoURL : 'img/unknownUser.png'// operador ternário: se usuário tiver foto mostre foto senão mostre a img do app
    userName.innerHTML = user.displayName//Mostrando nome do usuario
    userEmail.innerHTML = user.email
    hideItem(auth)

    getDefaultTodoList()
    
    search.onkeyup = function() {
        if (search.value != '') {
            var searchText = search.value.toLowerCase()
            dbRefUsers.child(user.uid)
            .orderByChild('nameLowerCase')//ordena as tarefas pelo nome
            .startAt(searchText).endAt(searchText + '\uf8ff')//delimita os resultados de pesquisa
            .once('value').then (function (dataSnapshot) {// Busca tarefas filtradas somente uma 'once'
                fillTodoList(dataSnapshot)
                
            })
        } else {
            getDefaultTodoList()
        }
    }

    showItem(userContent)
}

/**************************
****BUSCA EM TEMPO REAL****
**************************/ 
//Busca tarefas em tempo real (listagem padrão utilizando (on))
function getDefaultTodoList() {
    dbRefUsers.child(firebase.auth().currentUser.uid)
    .orderByChild('nameLowerCase') //ordena as tarefas pelo nome
    .on('value', function (dataSnapshot) {//quando houver alteração de tarefas no BD do usuário fillTodoList envia um snapshot
        fillTodoList(dataSnapshot)
    })
}

/**************************
**USUÁRIO NÃO AUTENTICADO**
**************************/ 
//Mostra o conteúdo do usuário não autenticado
function showAuth() {
    authForm.email.value = ''
    authForm.password.value = ''
    hideItem(userContent)
    showItem(auth)
}

/**************************************
***Centraliza e traduz msgs de ERROS***
***************************************/
function showError(prefix, error) {
    console.log(error.code)
    hideItem(loading)

    switch (error.code) {
        case 'auth/invalid-email': alert(prefix + ' ' + 'E-mail inválido!')
        break;
        case 'auth/wrong-password': alert(prefix + ' ' + 'Senha inválida!')
        break;       
        case 'auth/weak-password': alert(prefix + ' ' + 'A senha deve ao menos 6 caracteres!')
        break;
        case 'auth/email-already-in-use': alert(prefix + ' ' + 'Esse e-mail já está em uso!')
        break;
        case 'auth/popup-closed-by-user': alert(prefix + ' ' + 'O popup de autenticação foi fechado antes da operação ser concluída!')
        break;
        case 'storage/canceled': 
        break;
        case 'storage/unauthorized': alert(prefix + ' ' + 'Falha ao acessar o Cloud Storage!')
        break;
        
        default: alert(prefix+ ' ' + error.message)
    }
}

// Atributos extras de configuração de e-mail
var actionCodeSettings = {
    url: 'https://todolist-e7e7c.firebaseapp.com'
}

var database = firebase.database()
var dbRefUsers = database.ref('users')// Necessário para adicionar documentos ao database