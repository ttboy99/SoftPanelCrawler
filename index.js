const puppeteer = require('puppeteer');
const express = require('express')

const agents = [];
const nameID = "#agtName_"
const phoneID = "#agtPhone_"
const timeID = "#agtStatusTime_"

class Agent{
    constructor(id,name,phoneNumber,time){
        this.id = id;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.time = time;
    }

    get id(){
        return this._id;
    }
    get name(){
        return this._name;
    }
    get phoneNumber(){
        return this._phoneNumber;
    }
    get time(){
        return this._time;
    }
    get color(){
        return this._color;
    }
    set id(value){
        this._id = value;
    }
    set name(value){
        this._name = value;
    }
    set phoneNumber(value){
        this._phoneNumber = value;
    }
    set time(value){
        this._time = value;
    }
    set color(value){
        this._color = value;
    }

}

const app = express()
    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    const port = 3000

async function run () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("http://10.193.1.50:9060/wbm/displayPanel.htm?name=IT");
    // let element = await page.$(selector);
    // let value = await page.evaluate(el => el.textContent, element);
    // let value = page.waitForSelector('g[id^="agentWidget"]')
    // lelt value2 = await page.evaluate('document.querySelector("'+selector+'>rect").getAttribute("fill")')
    // let value = await page.evaluate(() => document.querySelectorAll('g[id^="agentWidget"]>rect'),el => el.getAttribute("fill"));
    await initData(page);
    while (true) {
        await update(page);
        await new Promise(r => setTimeout(r, 500));
    }
    await page.screenshot({path: 'screenshot.png'});
    browser.close();
}
async function update(page){
    let colors = await page.$$eval('g[id^="agentWidget"]>rect',boxes => boxes.map(box => box.getAttribute("fill")));
    for (let i = 0; i < agents.length; i++) {
        let agent = agents[i];
        agent.color = await page.evaluate('document.querySelector("#agentWidget_'+agent.id+'>rect").getAttribute("fill")');
        agent.time = await page.evaluate('document.querySelector("'+timeID+agent.id+'").textContent');
    }
}
async function getInnerHTML(page){
    await page.waitForSelector('g[id^="agentWidget"]>rect');
    let widgets = await page.evaluate(() => {
        var temp = document.querySelectorAll('g[id^=\"agentWidget_\"]');
        var return1 = "";
        temp.forEach(function(element) {var innerHTML = element.innerHTML; return1 += innerHTML});
        return return1;
    });
    console.log(widgets)
    //widgets = jsonFromHTML(widgets);
    //console.log(util.inspect(widgets, {showHidden: false, depth: null, colors: true}))

}

async function initData(page){
    await page.waitForSelector('g[id^="agentWidget"]');
    var agentsHTMLIDs = await page.$$eval('g[id^="agentWidget_"]', el => el.map(x => x.getAttribute("id")));
    var agentIDs = [];
    
    for (let i = 0; i < agentsHTMLIDs.length; i++) {
        agentIDs[i] = agentsHTMLIDs[i].split("_")[1];
    }


    for (let i = 0; i < agentIDs.length; i++) {
        let id = agentIDs[i];
        let selector = nameID + id;
        let name = await page.evaluate('document.querySelector("'+nameID+id+'").textContent');
        let phoneNumber = await page.evaluate('document.querySelector("'+phoneID+id+'").textContent');
        let time =  await page.evaluate('document.querySelector("'+timeID+id+'").textContent');
        console.log("Found agent name:" +name);
        agents.push(new Agent(agentIDs[i], name, phoneNumber, time));
    }
    runWebserver();
}

//Webserver
function runWebserver(){
app.get('/IT', (req, res) => {
    res.render('IT', { agents });
  })

app.get('/IT/get', (req, res) => {
    res.set('Content-Type', 'text/json')
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(JSON.stringify(agents));
  })
  app.use('/static', express.static(__dirname + '/resources'))
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}
run();