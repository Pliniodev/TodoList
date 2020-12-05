//Trata a submissão do formulário de tarefas 
todoForm.onsubmit = function (event) {
    event.preventDefault() // Evita o redirecionamento da página
    
    if (quantityDataVerify()) {
        console.log(quantityDataVerify())
        if (todoForm.name.value != '') {
            var file = todoForm.file.files[0] //seleciona o primeiro arquivo da seleção de arquivos
            if (file != null) { //verifica se o arquivo foi selecionado
                if (file.type.includes('image')) { //verifica se o arquivo é uma imagem
                    //Verifica o tamanho do arquivo
                    if (file.size > 1024 * 1024 * 2) {
                        alert('A imagem não pode ser maior que 2Mb. A imagem selecionada tem : ' + (file.size / 1024 / 1024).toFixed(3) + 'Mb')
                        return
                    }
                    // compõem o nome do arquivo
                    var imgName = firebase.database().ref().push().key + '-' + file.name
                    //compõe o caminho do arquivo
                    var imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName
                    //Cria uma referência de arquivo usando o caminho criado na linha acima
                    var storageRef = firebase.storage().ref(imgPath)
                    //inicia o processo de upload
                    var upload = storageRef.put(file)

                    trackUpload(upload).then(function () {
                        storageRef.getDownloadURL().then(function (downloadURL) {
                            var data = {//caso o usuário queira subir uma imagem
                                imgUrl: downloadURL,
                                name: todoForm.name.value,
                                nameLowerCase: todoForm.name.value.toLowerCase()
                            }

                            completeTodoCreate(data) //completa a criação de tarefas 
                        })
                    }).catch(function (error) {
                        showError('Falha ao adicionar tarefa. ', error)
                    })
                } else {
                    alert('O arquivo selecionado precisa ser uma imagem. Tente novamente')
                }
            } else {//caso o usuário NÃO queira subir uma imagem
                var data = {
                    name: todoForm.name.value,
                    nameLowerCase: todoForm.name.value.toLowerCase()
                }

                completeTodoCreate(data) //completa a criação de tarefas
            }
        } else {
            alert('Ao criar uma tarefa o nome não pode estar vazio')
        }
    } else {
        alert('Você adicionou 5 tarefas, para adicionar mais, verifique seu email.')
    }
}

/*************************************
**COMPLETA A CRIAÇÃO DAS TAREFAS**
**************************************/
//(persiste as informações no banco de dados)
function completeTodoCreate(data) {
    dbRefUsers.child(firebase.auth().currentUser.uid).push(data).then(function () {
        console.log('Tarefa "' + data.name + '" adicionada com sucesso')
    }).catch(function (error) {
        showError('Falha ao adicionar tarefa. (Máximo 30 caracteres): ', error)
    })

    todoForm.name.value = ''//zerar campo nome
    todoForm.file.value = ''//zerar campo file

}

/**************************************
*BARRA DE PROGRESSO E BOTÃO PLAY/PAUSE*
***************************************/
//Rastreia o progresso do upload
function trackUpload(upload) {
    return new Promise(function (resolve, reject) {
        showItem(progressFeedback)
        upload.on('state_changed',
            function (snapshot) { //segundo argumento: recebe informações sobre o upload
                progress.value = snapshot.bytesTransferred / snapshot.totalBytes * 100

            }, function (error) {//terceiro argumento: Funcção executada em caso de erro no upload
                hideItem(progressFeedback)
                reject(error)

            }, function () {// quarto argumento: será executada em caso de sucesso de upload
                console.log('Upload realizado com sucesso')
                hideItem(progressFeedback)
                resolve()
            })

        var playPauseUpload = true //Estado de ocntrole do nosso upload(pausado ou em andamento)
        playPauseBtn.onclick = function () {//botão de upload foi clicado
            playPauseUpload = !playPauseUpload // inverte o estado de controle do upload

            if (playPauseUpload) { //se deseja retomar o upload faça...
                upload.resume() //retoma o upload
                playPauseBtn.innerHTML = 'Pausar'
                console.log('Upload retomado')
            } else { //se deseja pausar o upload faça...
                upload.pause()//Pausa o upload
                playPauseBtn.innerHTML = 'Continuar'
                console.log('upload pausado')
            }
        }

        cancelBtn.onclick = function () {//botão para cancelar
            upload.cancel()
            hideItem(progressFeedback)
            resetTodoForm()
        }
    })
}

/*********************************
*********LISTA DE TAREFAS*********
**********************************/
//Exibe a lista de tarefas do usuário
function fillTodoList(dataSnapshot) {
    ulTodoList.innerHTML = ''
    var num = dataSnapshot.numChildren()
    todoCount.innerHTML = num + (num > 1 ? ' tarefas' : ' tarefa') + ':'//Exibe na interface o numero de tarefas
    dataSnapshot.forEach(function (item) { // Percorre todos os elementos
        var value = item.val()
        var li = document.createElement('li') //Cria um elemento do tipo li
        li.id = item.key //Define o id do li como a chave da tarefa

        var imgLi = document.createElement('img')//cria um elemento img
        //configura o src(origem da imagem) como imgUrl da tarefa
        imgLi.src = value.imgUrl ? value.imgUrl : 'img/defaultTodo.png'
        imgLi.setAttribute('class', 'imgTodo')//define as classe de estilização da img
        li.appendChild(imgLi)//adiciona o img dentro do li

        var spanLi = document.createElement('span') //Cria um elemento do tipo spam
        spanLi.appendChild(document.createTextNode(value.name)) // Adiciona o elemento de texto dentro da nossa spam
        li.appendChild(spanLi) // Adiciona o span dentro da li

        //Configuração de botão de exclusão
        var liRemoveBtn = document.createElement('button') // Cria um botão para a remoção da tarefa
        liRemoveBtn.appendChild(document.createTextNode('Excluir')) // Define o texto do botão como 'Excluir'
        liRemoveBtn.setAttribute('onclick', 'removeTodo(\"' + item.key + '\")') //Configura o onclick do botão de remoção de tarefas
        liRemoveBtn.setAttribute('class', 'danger todoBtn') //Define classes de estilização para o botão de exclusão
        li.appendChild(liRemoveBtn) //Adiciona um botão de remoção no li

        //Configuração de botão de update
        var liUpdateBtn = document.createElement('button') // Cria um botão para a remoção da tarefa
        liUpdateBtn.appendChild(document.createTextNode('Editar')) // Define o texto do botão como 'Editar'
        liUpdateBtn.setAttribute('onclick', 'updateTodo(\"' + item.key + '\")') //Configura o onclick do botão de atualização de tarefas
        liUpdateBtn.setAttribute('class', 'alternative todoBtn') //Define classes de estilização para o botão de atualização
        li.appendChild(liUpdateBtn) //Adiciona um botão de atualização no li

        ulTodoList.appendChild(li)// Adiciona o li dentro da lista de tarefas
        li.setAttribute('class', 'inLi')
    })

}


// Remove tarefas do BD
function removeTodo(key) {
    var todoName = document.querySelector('#' + key + ' > span')
    var todoImg = document.querySelector('#' + key + ' > img')

    var confirmation = confirm('Realmente deseja remover a tarefa \"' + todoName.innerHTML + '\"?')
    if (confirmation) {
        dbRefUsers.child(firebase.auth().currentUser.uid).child(key).remove().then(function () {
            console.log('Tarefa "' + todoName.innerHTML + '" removida com sucesso')
            removeFile(todoImg.src)//chamada para função que remove a img do bd
        }).catch(function (error) {
            showError('Falha ao remover a tarefa: ', error)
        })
    }
}

// Remove arquivos
function removeFile(imgUrl) {
    console.log(imgUrl)

    //Verifica se ImgUrl contém a imagem padrão de tarefas
    var result = imgUrl.indexOf('img/defaultTodo.png')

    if (result == -1) { //Se não for a imagem padrão de tarefas, faça...
        firebase.storage().refFromURL(imgUrl).delete().then(function () {
            console.log('Arquivo removido com sucesso')
        }).catch(function (error) {
            console.log('Falha ao remover o arquivo')
            console.log(error)
        })
    } else {//se imgUrl representa a imagem padrão de tarefas, faça..
        console.log('Nenhum arquivo removido')
    }
}

/************************************
**PREPARA A ATUALIZAÇÃO DAS TAREFAS**
*************************************/
var updateTodoKey = null
function updateTodo(key) {
    updateTodoKey = key //atribui o conteudo de key dentro de uma variavel global
    var todoName = document.querySelector('#' + key + ' > span')
    //Altera o titulo do formulario de tarefas
    todoFormTitle.innerHTML = '<strong>Editar a tarefa</strong> ' + todoName.innerHTML
    //Altera o texto da entrada de nome (coloca o nome da tarefa a ser atualizada)
    todoForm.name.value = todoName.innerHTML
    hideItem(todoForm.submitTodoForm)
    showItem(cancelUpdateTodo)
}

//Restaura o estado inicial do formulario de tarefas
function resetTodoForm() {
    todoFormTitle.innerHTML = ' Adicionar tarefa: '
    hideItem(cancelUpdateTodo)
    todoForm.submitTodoForm.style.display = 'initial'
    todoForm.name.value = ''
    todoForm.file.value = ''
}

/*************************************
**CONFIRMA A ATUALIZAÇÃO DAS TAREFAS**
**************************************/
function confirmTodoUpdate() {
    if (todoForm.name.value != '') {
        var todoImg = document.querySelector('#' + updateTodoKey + ' > img ') // referência da imagem antiga
        var file = todoForm.file.files[0] //seleciona o primeiro arquivo da seleção de arquivos
        if (file != null) { //verifica se o arquivo foi selecionado
            //Verifica o tamanho do arquivo
            if (file.size > 1024 * 1024 * 2) {
                alert('A imagem não pode ser maior que 2Mb. A imagem selecionada tem : ' + (file.size / 1024 / 1024).toFixed(3) + 'Mb')
                return
            }

            hideItem(cancelUpdateTodo)

            if (file.type.includes('image')) { //verifica se o arquivo é uma imagem
                // compõem o nome do arquivo
                var imgName = firebase.database().ref().push().updateTodoKey + '-' + file.name
                //compõe o caminho do arquivo
                var imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName
                //Cria uma referência de arquivo usando o caminho criado na linha acima
                var storageRef = firebase.storage().ref(imgPath)
                //inicia o processo de upload
                var upload = storageRef.put(file)

                trackUpload(upload).then(function () {
                    storageRef.getDownloadURL().then(function (downloadURL) {
                        var data = {
                            imgUrl: downloadURL,
                            name: todoForm.name.value,
                            nameLowerCase: todoForm.name.value.toLowerCase()
                        }

                        completeTodoUpdate(data, todoImg.src) //completa a atualização de tarefas
                    })
                }).catch(function (error) {
                    showError('Falha ao atualizar tarefa: ', error)
                })
            } else {
                alert('O arquivo selecionado precisa ser uma imagem!')
            }
        } else {//se nenhuma imagem for selecionada...
            var data = {
                name: todoForm.name.value,
                nameLowerCase: todoForm.name.value.toLowerCase()
            }

            completeTodoUpdate(data) //completa a atualização de tarefas 

        }
    } else {
        alert('O nome da tarefa não pode ser vazio')
    }
}

/*************************************
**COMPLETA A ATUALIZAÇÃO DAS TAREFAS**
**************************************/
//(persiste as informações no banco de dados)
function completeTodoUpdate(data, imgUrl) {
    dbRefUsers.child(firebase.auth().currentUser.uid).child(updateTodoKey).update(data).then(function () {
        console.log('Tarefa "' + data.name + '" atualizada com sucesso')
        if (imgUrl) {
            removeFile(imgUrl)//remove o arquivo antigo
        }
    }).catch(function (error) {
        showError('Falha ao atualizar a tarefa. (Máximo 30 caracteres): ', error)
    })
    resetTodoForm()//restaura o estado inicial do formulario de tarefas
}

//Verifica o tamanho do arquivo

