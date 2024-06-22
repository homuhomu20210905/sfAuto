global.echo = () => {
    Logger.log("Hello")
}

global.doGet = () => {
    return HtmlService.createTemplateFromFile('index').evaluate()
        .setTitle('vue-gas-app')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
}