function quantityDataVerify() {
    let liCount = document.getElementsByTagName('li').length
    console.log('a meu deus', liCount)
    if ( (liCount < 5)
    || (emailVerified.innerHTML === 'E-mail verificado' 
    || emailVerified.innerHTML === 'Autenticação por provedor confiável, não é necessário verificar e-mail')) {
        
        return true
    } else {
        return false 
    }
}