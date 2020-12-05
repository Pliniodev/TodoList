//Tradução da msg do email de verificação
firebase.auth().languageCode = 'pt-BR'

//Função que trata a submissão do formulário de autenticação
authForm.onsubmit = function (event) {
    showItem(loading)
    event.preventDefault()
    if (authForm.submitAuthForm.innerHTML == 'Acessar') {
        firebase.auth().signInWithEmailAndPassword(authForm.email.value, authForm.password.value).catch(function (error){
            showError('Falha no acesso: ', error)
        })
    } else {
        firebase.auth().createUserWithEmailAndPassword(authForm.email.value, authForm.password.value).catch(function (error){
            showError('Falha no cadastro: ', error)
        })       
    }   
}     

//Função que centraliza e trata a autenticação
firebase.auth().onAuthStateChanged(function (user){
    hideItem(loading)
    if (user) {
        showUserContent(user)
    } else {
        showAuth()
    }
})

//Função que permite ao usuário sair da conta dele
function signOut() {
    firebase.auth().signOut().catch(function (error) {
        showError('Falha ao sair da conta: ', error)
    
    })
}

// Função que permite ao usuário fazer a verificação do email dele
function sendEmailVerification() {
    showItem(loading)
    var user = firebase.auth().currentUser
    user.sendEmailVerification(actionCodeSettings).then(function () {
        alert('Email de verificação enviado para ' + user.email + '! Verifique a sua caixa de entrada')
    }).catch(function (error) {
        showError('Falha ao enviar mensagem de verificação de e-mail: ', error)
    }).finally(function () {
        hideItem(loading)
    })
}

// Função que permite ao usuário redefinir sua senha
function sendPasswordResetEmail(){
    var email = prompt('Redefinir senha! Informe o seu endereço de e-mail.', authForm.email.value)
    if (email) {
       showItem(loading)
       firebase.auth().sendPasswordResetEmail(email, actionCodeSettings).then(function (){
           alert('O Email de redefinição de senha foi enviado para ' + email + '.')
       }).catch(function (error) {
           showError(' Falha ao enviar e-mail de redefinição de senha: ', error)
       }).finally(function () {
           hideItem(loading)
       }) 
    } else {
        alert('Preencha o campo de email para redefinição da senha!')
    }
}

//Função que permite a autenticação pelo google
function signInWithGoogle() {
    showItem(loading)
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function (error) {
        showError('Falha ao autenticar com o Google: ', error)
    })
}

//Função que permite a autenticação pelo github
function signInWithGithub() {
    showItem(loading)
    firebase.auth().signInWithPopup(new firebase.auth.GithubAuthProvider()).catch(function (error) {
        showError('Falha ao autenticar com o Github: ', error)
    })
}

//Função que permite a autenticação pelo facebook
function signInWithFacebook() {
    showItem(loading)
    firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider()).catch(function (error) {
        showError('Falha ao autenticar com o Facebook: ', error)
    })
}

//função que permite atualizar nome de usuário
function updateUserName() {
    var newUserName = prompt('Informe um novo nome de usuário.', userName.innerHTML)
    if (newUserName && newUserName != '') {
        userName.innerHTML = newUserName
        showItem(loading)
        firebase.auth().currentUser.updateProfile({
            displayName: newUserName
        }).catch(function (error) {
            showError('Falha ao atualizar o nome de usuário: ', error)
        }).finally(function (){
            hideItem(loading)
        })
    } else {
        alert(' O nome de usuário não pode ser vazio')
    }
}

//função que permite remover contas de usuário
function deleteUserAccount() {
    var confirmation = confirm('Realmente deseja excluir a sua conta?')
    if (confirmation) {
        showItem(loading)
        firebase.auth().currentUser.delete().then(function () {
            alert('Conta removida com sucesso')
        }).catch(function (error) {
            showError('Falha ao remover a sua conta: ', error)
        }).finally(function () {
            hideItem(loading)
        })
    }
}