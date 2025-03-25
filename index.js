
//modulos externos
import inquirer from 'inquirer'
import chalk from 'chalk'

//modulos internos
import fs from 'fs'

console.log('iniciamos accounts')

operation()//pegando a ação do user
function operation() {

    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que voce deseja fazer',
            choices: ['criar conta', 'consultar saldo', 'depositar', 'sacar', 'sair'],
        },
    ]).then((answer) => {

        const action = answer['action']

        if (action === 'criar conta') {
            createAccount()
        } else if(action === 'consultar saldo') {
            getAccountBalance()

        } else if(action === 'depositar') {
            deposit()

        } else if(action === 'sacar') {
            saque()

        } else if(action === 'sair') {
            console.log(chalk.bgBlue.black('obrigado por usar o Accounts!'))
            process.exit()
        }

    })
    .catch((err) => console.log(err))

}

//create account
function createAccount() {
    console.log(chalk.bgGreen.black('Parabens por escolher o nosso banco'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))
    buildAccount()
}

//metodo que cria a conta
function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para a sua conta:'

        }
    ]).then(answer => {
        const accountName = answer['accountName']
        console.info(accountName)

        if(!fs.existsSync('accounts')) { //se nao existir o diretorio accounts
            fs.mkdirSync('accounts') //crie o diretorio
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('erro, essa conta ja existe, escolha outro nome'), )
            buildAccount() 
            return //deve-se obrigatoriamente retornar qualquer erro no sistema
        }


        fs.writeFileSync(
            `accounts/${accountName}.json`, 
            '{"balance": 0}', 
            function (err) {
                console.log(err)
            },
        )

        console.log(chalk.green('conta criada com sucesso'))
        operation()
    })
    .catch((err) => console.log(err))
}

//funçao deposit
function deposit() {
    
    inquirer.prompt([
        {
            name: 'account',
            message: 'digite o nome da conta que deseja depositar'
        }
    ]).then(answer => {
        const account = answer['account']

        if (!fs.existsSync(`accounts/${account}.json`)) {
            console.log(chalk.bgRed.black('essa conta não existe, tente novamente'))
            deposit()
            return
        }

        inquirer.prompt([
            {
                name: 'deposito',
                message: 'digite o valor que deseja depositar:'
            }

        ]).then(answer => {

            const deposito = answer['deposito']

            //add an amount
            addAmount(account, deposito)
            operation()
           
        })
        .catch((err) => {
            console.log(err)
        })
        
    })
    .catch((err) => {
        console.log(err)
    })
}

//adicionando o deposito e reescrevendo no arquivo os valores atualizados
function addAmount(account, value) {
    const accountData = getAccount(account)

    if (!value) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente'))
        return deposit()
    }
    // accountData object js
    accountData.balance = parseFloat(value) + parseFloat(accountData.balance) //add o value + o valor que temos na conta

    fs.writeFileSync( //escrevendo no file os dados atualizados
        `accounts/${account}.json`,
        JSON.stringify(accountData), //transformando json em texto
        function (err) {
            console.log(err)
        }, 
    )

    console.log(chalk.green(`foi depositado o valor de R$${value} na sua conta `))
   
}

// pegar a conta ler o arquivo e retorna-lo em objeto para que possamos acessalo
function getAccount(account) {
    const accountJson = fs.readFileSync(`accounts/${account}.json`, {
        encoding: 'utf8', //prevendo acentos
        flag: 'r' //só quer ler este arquivo
    })
    // accountJson vai vim em .json mas esta em um arquivo entao é um texto e não objeto

    return JSON.parse(accountJson) //aqui retorno ele em objeto js
}

//consult accountBalance
function getAccountBalance() {
    
    inquirer.prompt([
        {
            name: 'account',
            message: 'Digite o nome da conta para consulta: '
        }

    ]).then(answer => {
        const accountC = answer['account']

        if (!fs.existsSync(`accounts/${accountC}.json`)) {
            console.log(chalk.bgRed.black('essa conta não existe, digite novamente'))
            return getAccountBalance()
        }

        const accountData = getAccount(accountC)
        const value = accountData.balance
        console.log(chalk.green(`O saldo de sua conta é R$${value}`))

        operation()
    })
    .catch((err) => {
        console.log(err)
    })
}

//saque account
function saque() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da conta que deseja sacar: '
        }

    ]).then(answer => {
        const accountSaq = answer['accountName']

        if (!fs.existsSync(`accounts/${accountSaq}.json`)) {
            console.log(chalk.bgRed.black('Essa conta não existe, tente novamente'))
            return saque()
        }

        inquirer.prompt([
            {
                name: 'saqueb',
                message: 'Digite quanto deseja sacar: '
            }

        ]).then(answer => {
            const valueSaque = answer['saqueb']
            saqueBalance(accountSaq, valueSaque)
           
        })
        .catch((err) => console.log(err))

    })
    .catch((err) => console.log(err))
    
}

//calculos do saque
function saqueBalance(accountsq, value) {
    const accountdatas = getAccount(accountsq)

    if(!value) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente.'))
        return saque()
    }

    if (parseFloat(value) > parseFloat(accountdatas.balance)) {
        console.log(chalk.bgRed('Erro, o valor que deseja sacar é maior do que o valor em conta'))
        return opcoes()
    }

    accountdatas.balance = parseFloat(accountdatas.balance) - parseFloat(value)

    fs.writeFileSync( 
        `accounts/${accountsq}.json`,
        JSON.stringify(accountdatas), 
        function (err) {
            console.log(err)
        }, 
    )

    console.log(chalk.green(`foi sacado o valor de R$${value} de sua conta `))

    operation()
}

//opcao emprestimo
function opcoes() {
    
    inquirer.prompt([
        {
            type: 'list',
            name: 'respo',
            message: 'Se caso o valor de saque excede o valor em conta, temos as seguintes opções',
            choices: ['Emprestimo', 'Redefinir Quantia', ]
        }
    ]).then(answer => {
        const action2 = answer['respo']
        

        if (action2 === 'Emprestimo') {
            console.log(chalk.bgGreen('Bem vindo ao Emprestimo Accounts!'))
            console.log(chalk.bgGreen('juros de 4% ao mês sendo a primeira parcela para daqui a 40 dias.'))
            escolhaValor()
        } else {
            return saque()
        }


    })
    .catch((err) => console.log(err))
}

function escolhaValor() {
    
    inquirer.prompt([
        {
            name: 'value',
            message: 'Digite o valor de emprestimo desejado: '
        }

    ]).then(answer => {
        const value = answer['value']

        console.log(chalk.green('emprestimo concedido'))
        
        inquirer.prompt([
            {   
                type: 'list',
                name: 'meses',
                message: 'Deseja parcelar em quantas vezes?',
                choices: ['2', '3', '4', '5','6', '7', '8', '9', '10', '11', '12']
            }
        ]).then(answer => {
            const mes = answer['meses']

            const valueTotal = parseFloat(value) * (1 + 0.04) ** parseFloat(mes)
            const parcela = valueTotal / parseFloat(mes)

            console.log(chalk.green(`parcelado em ${mes}x ficara com parcelas de R$${parcela.toFixed(2)} por mês, sendo R$${valueTotal.toFixed(2)} o valor total final a ser pago`))
            
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'action3',
                    message: 'Confirmar Operação?',
                    choices: ['Sim', 'Não', 'Redefinir']
                }

            ]).then(answer => {
                const action3 = answer['action3']

                if (action3 === 'Sim') {
                    console.log(chalk.green('Operação realizada com sucesso'))
                    operation()
                } else if (action3 === 'Não') {
                    console.log(chalk.blue('Operação não realizada'))
                    operation()
                } else {
                    return escolhaValor()
                }

            })
            .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}
