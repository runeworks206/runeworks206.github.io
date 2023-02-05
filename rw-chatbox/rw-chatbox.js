/*
   let rwc = runeworks.chatbox.new({
    uuid: 'smol',
    channels: ['main','admin','notifs','a','b','c','d','e','f'],
   })
 */

runeworks = typeof runeworks != 'undefined' ? runeworks : {}

runeworks.chatbox = (function() {
  /* Variables */
  // Meta Variables
  let defaults = {
    // settings
    defaultChannel  : 'main',
    channels        : ['main','notifications'],
    commandsLimit   : 5,
    scrollbackLimit : 100,
    // functions
    uuid            : function() {
      let d = new Date().getTime()
      if (typeof window != 'undefined' && window.performance && typeof window.performance.now == 'function') { d += performance.now() }
      return 'xxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(v) {
        let r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (v == 'x' ? r : (r&0x3|0x8)).toString(16)
      })
    },
    // Parent
    parent          : 'body',
    // Container
    height          : '98ch',
    width           : '80ch',
    minHeight       : '23ch',
    minWidth        : '56ch',
    padding         : '0px',
    background      : 'rgba(   1,   1,   1, 0.44)',
    border          : '1px solid rgba( 255, 255, 255, 0.11)',
    borderRadius    : '6px',
    color           : 'rgba( 255, 255, 255, 1.00)',
    mainFontFamily  : "'Poppins', sans-serif",
    mainFontSize    : '9pt',
    // Header
    headerHeight    : '5vh',
    headerFontSize  : '11pt',
    headerBorder    : '1px solid rgba(   1,   1,   1, 0.55)',
    headerFontColor : 'rgba( 255, 255, 255, 1.00)',
    // Tabs
    tabHeight       : '3.5vh',
    tabLeftPadding  : '0.2em',
    tabsWidth       : '9ch',
    tabsFontSize    : '11pt',
    tabsNavigatorWidth      : '3em',
    tabsFontColor           : 'rgba( 189, 189, 189, 1.00)',
    tabsFontColorHighlighted: 'rgba( 255, 255, 255, 1.00)',
    tabsBorderColor         : 'rgba(  84,  84,  84, 0.44)',
    tabsInactiveColor       : 'rgba(   1,   1,   1, 0.04)',
    tabsInactiveHoverColor  : 'rgba(   1,   1,   1, 0.14)',
    tabsContinuationWidth   : '2ch',
    arrowSize        : '8px',
    arrowColor       : 'rgba( 255, 255, 255, 0.33)',
    arrowColorActive : 'rgba( 255, 255, 255, 0.55)',
    arrowColorInvalid: 'rgba(  14,  14,  14, 0.55)',
    // Output
    outputFontSize   : '10pt',
    outputFontColor  : 'rgba( 255, 255, 255, 1.00)',
    outputActiveColor: 'rgba(   1,   1,   1, 0.55)',
    // Input 
    inputHeight     : '5.5vh',
    inputBoxHeight  : '4.1ch',
    inputBottom     : '0.4ch',
    inputPadding    : '0.4em',
    inputBackground : 'rgba( 255, 255, 255, 0.03)',
    inputBackgroundFocus: 'rgba( 255, 255, 255, 0.13)',
    inputRadius     : '4px',
    inputFontSize   : '11pt',
    inputFontColor  : 'rgba( 211, 211, 211, 1.00)',
    inputFontColorFocus: 'rgba( 255, 255, 255, 1.00)',
    // Line
    speakerFontSize   : '9pt',
    lineTopPadding    : '0.2em',
    lineBottomPadding : '0.2em',
    lineLeftPadding   : '30px',
    lineRightPadding  : '1.2ch',
    lineSpeakerColor  : 'rgba( 201, 201, 201, 1.00)',
    lineTimestampColor: 'rgba( 101, 101, 101, 1.00)',
    statusFontColor   : 'rgba( 121, 121, 121, 1.00)',
  }

  // Event Controller template
  let events = {
    /* => */
    receiveMessage : 'rw-receive-message-UUID',
    receiveData    : 'rw-receive-data-UUID',
    userTyping     : 'rw-user-typing-UUID',
    userStopped    : 'rw-user-stopped-UUID',
    tabSwitch      : 'rw-tab-switch-UUID',
    arrowLeft      : 'rw-arrow-left-UUID',
    arrowRight     : 'rw-arrow-right-UUID',
    /* <- */
    raiseMessage   : 'rw-raise-message-UUID',
  }
  // In-memory variables
  // Computational variables
  let UUIDRegex = /UUID/g
  

  class RWChatBox {
    constructor(options) {
      this.outputs   = {}
      this.tabs      = {}
      this.channels  = []
      this.users     = []
      this.roles     = []
      this.commands  = []

      // Helper function
      this.raiseEvent = raiseEvent
      this.addCSS     = addCSS
      this.getUUID    = defaults.uuid

      // settings
      this.defaultChannel  = !options ? defaults.defaultChannel  : options?.defaultChannel  ? options?.defaultChannel  : defaults.defaultChannel
      this.commandsLimit   = !options ? defaults.commandsLimit   : options?.commandsLimit   ? options?.commandsLimit   : defaults.commandsLimit
      this.scrollbackLimit = !options ? defaults.scrollbackLimit : options?.scrollbackLimit ? options?.scrollbackLimit : defaults.scrollbackLimit

      // generate UUID
      this.uuid   = !options ? defaults.uuid() : options?.uuid ? options?.uuid : defaults.uuid()
      // accessor for Body
      this.body   = document.querySelector('body')
      // accessor for Parent
      this.parent = document.querySelector(!options ? defaults.parent : options?.parent ? options?.parent : defaults.parent)

      // modify events
      this.events = {}
      for (var key in events) {
        this.events[key] = events[key].replace(UUIDRegex, this.uuid)
      }
      console.log('This chatbox\'s events list:', this.events)
      
      /* UI */
      // modify Markup
      this.markup = markupTemplate.replace(UUIDRegex, this.uuid)
      // add Markup
      this.parent.insertAdjacentHTML('beforeend', this.markup)
      // accessor for self
      this.self = document.querySelector('#rwc-' + this.uuid)

      // add channels from options
      let channels = !options ? defaults.channels : options?.channels ? options?.channels : defaults.channels
      if (channels.indexOf('main') == -1) { channels.unshift('main') }
      channels.forEach(channel => {
        this.addChannel({
          identifier: channel,
        })
      })
      
      // activate main
      this.activate('main')
      
      // accessor for Input
      this.input  = document.querySelector('#rwc-input-' + this.uuid + ' input')

      // modify CSS Rules
      this.cssIdentifier = 'rwc-css-' + this.uuid
      this.cssRules = cssTemplate.replace(UUIDRegex, this.uuid)
      // add CSS Rules
      this.addCSS(this.cssRules, '#rwc-' + this.uuid, this.cssIdentifier)
      
      // add navigator arrows
      this.modifyRender()

      // modify Line Markup
      this.lineMarkup = lineTemplate.replace(UUIDRegex, this.uuid)
 
      /* Eventify */
      // Start listening
      this.listen()

      // make draggable
      this.draggable(this)
    }

    /* Eventification */
    listen() {
      let body = document.querySelector('body')
      Object.keys(this.events).forEach((e,i) => {
        let ev = this.events[e]
        switch(e) {
          case 'receiveMessage':
            body.addEventListener(ev, this.receiveMessage.bind(this))
            break;
          case 'receiveData': 
            body.addEventListener(ev, this.processData.bind(this))
            break;
          case 'userTyping': 
            body.addEventListener(ev, this.userTyping.bind(this))
            break;
          case 'userStopped': 
            body.addEventListener(ev, this.userStopped.bind(this))
            break;
          case 'tabSwitch':
            body.addEventListener(ev, this.tabSwitch.bind(this))
            break;
          case 'arrowLeft':
            body.addEventListener(ev, this.arrowLeft.bind(this))
            break;
          case 'arrowRight':
            body.addEventListener(ev, this.arrowRight.bind(this))
            break;
          default:
            console.log(`Event ${e} for ${this.uuid} does not have an assigned listener; it may be a broadcaster or is unassigned.`)
            break;
        }
      })
      this.input.addEventListener('keyup', (e) => {
        switch(e.code) {
          case 'Enter':
            this.raiseMessage()
            break;
          default:
            break;
        }
      })
      this.input.addEventListener('keydown', (e) => {
        switch(e.code) {
          case 'ArrowUp':
            this.cycleCommands('up', e)
            break;
          case 'ArrowDown':
            this.cycleCommands('down', e)
            break;
          default:
            break;
        }
      })
      // resize observer
      this.resizeObserver = new ResizeObserver(mutations => {
        // scroll to the bottom
        let m = Object.values(this.outputs).filter(item => item.id == this.active)
        if (m.length > 0) {
          m = m[0]
          m.element.scrollTop = m.element.scrollHeight
        }

        // manipulate the tabs
        let wrapped = document.querySelector(`#rwc-tabs-anchor-${this.uuid}`).offsetTop
        let parent  = document.querySelector(`#rwc-tabs-${this.uuid}`).offsetHeight
        // disable the arrows depending on tabs length
        if (wrapped <= parent) {
          // deactivate arrow-right
          document.querySelector(`#rwc-tabs-navigator-${this.uuid} .rwc-arrow-right`).classList.add('invalid')
        } else {
          // reactivate arrow-right
          document.querySelector(`#rwc-tabs-navigator-${this.uuid} .rwc-arrow-right`).classList.remove('invalid')
        }

        // re-expand the hidden list if the delta between the anchor and the arrows is greater than the tab width
        let f = document.querySelectorAll(`#rwc-tabs-${this.uuid} .rwc-tab.invisible`)
        if (f.length > 0) {
          
         let navigatorCoords = document.querySelector(`#rwc-tabs-navigator-${this.uuid} .rwc-arrow-left`).getBoundingClientRect()
         let anchorCoords    = document.querySelector(`#rwc-tabs-anchor-${this.uuid}`).getBoundingClientRect()
         let navigatorLeft   = navigatorCoords.x
         let anchorLeft      = anchorCoords.x
         let delta           = navigatorLeft - anchorLeft

         // delta is only valid if they are on the same line: 
         if (anchorCoords.top <= navigatorCoords.bottom) {
           let mainTab = document.querySelector(`#rwc-tab-${this.uuid}-main`).getBoundingClientRect()
           let dotsTab = document.querySelector(`#rwc-tabs-continuation-left-${this.uuid}`).getBoundingClientRect()
           if (delta > (mainTab.width + dotsTab.width * 1.2)) {
             // only if invisible exists
             let n = Math.floor(delta / mainTab.width)
             for (var i = (f.length - 1); i > -1; i--) {
               if (n > 0) {
                 f[i].classList.remove('invisible')
               }
               n--
             }
           }
           // recheck
           let g = document.querySelectorAll(`#rwc-tabs-${this.uuid} .rwc-tab.invisible`)
           if (g.length == 0) {
             // hide the continuation dots
             document.querySelector(`#rwc-tabs-continuation-left-${this.uuid}`).classList.add('invisible')
             // disable  the rwc-arrow-left
             document.querySelector(`#rwc-tabs-navigator-${this.uuid} .rwc-arrow-left`).classList.add('invalid')
           }
         }
        }
      })
      this.resizeObserver.observe(this.self)
    }

    /* Event Responders */
    receiveMessage(payload) {
      let r    = payload.detail

      this.printLine(r.user, r.message, r.timestamp, r?.channel ? r?.channel : null)
    }
    
    processData(payload) {
      let r    = payload.detail
      let type = r.type
      let data = r.data
      
      switch(type) {
        case 'add-channel':
          this.addChannel(data)
          break;
        case 'remove-channel':
          this.removeChannel(data)
          break;
        default:
          console.log(type, data)
          break;
      }
    }

    /* UX */
    printLine(user, msg, timestamp, channel) {
      let c = channel ? channel : this.defaultChannel
          c = 'rwc-output-' + this.uuid + '-' + c
      let d = 'rwc-output-' + this.uuid + '-main'
      
      let e = this.outputs[c].element
      let m = this.outputs[d].element
      
      // generate uuid
      let lineUUID = this.getUUID()
      
      // modify time
      let ti   = new Date(timestamp)
      let time = ti.getHours().toString().padStart(2,'0')
          + ':' + ti.getMinutes().toString().padStart(2,'0')
          + ':' + ti.getSeconds().toString().padStart(2,'0')
          + ' ' + (ti.getHours() >= 12 ? 'PM' : 'AM')  

      let t = this.lineMarkup
      t = t.replace('REPLACE_MESSAGE',   msg )
           .replace('REPLACE_SPEAKER',   user)
           .replace('REPLACE_TIMESTAMP', time)
           .replace('LineID', lineUUID)
           
      // add
      // Fastdom
      if (fastdom) {
        fastdom.measure(() => {
          fastdom.mutate(() => {
            e.insertAdjacentHTML('beforeend', t)
            e.scrollTop = e.scrollHeight
            if (c != d) {
              m.insertAdjacentHTML('beforeend', t)
              m.scrollTop = m.scrollHeight
            }
          })
        })
      } else {
        e.insertAdjacentHTML('beforeend', t)
        e.scrollTop = e.scrollHeight
        if (c != d) {
          m.insertAdjacentHTML('beforeend', t)
          m.scrollTop = m.scrollHeight
        }
      }
      
      // push into buffer
      let main = this.outputs[`rwc-output-${this.uuid}-main`].buffer
      let line = {
        message: msg,
        user   : user,
        time   : timestamp,
        channel: channel,
        id     : lineUUID,
      }
      // push
      main.push(line)
      
      // remove excess lines
      if (main.length > this.scrollbackLimit) {
        let outgoing = main.shift()
        // remove from buffers
        for (var key in this.outputs) {
          this.outputs[key].buffer = this.outputs[key].buffer.filter(_line => _line.id != outgoing.id)
        }
        // remove actual elements
        let f = document.querySelectorAll(`#rwc-${outgoing.id}`)
        for (var i = 0; i < f.length; i++) {
          let element = f[i]
          // Fastdom
          if (fastdom) {
            fastdom.measure(() => {
              fastdom.mutate(() => {
                element.remove()
              })
            })
          } else {
            element.remove()
          }
        }
      }
    }

    activate(which) {
      // reject if does not exist
      if (Object.values(this.outputs).map(output => output.id).indexOf(which) == -1) { console.log(`Channel ${which} not found.`); return }

      this.active = which
      // activate the output
      for (var key in this.outputs) {
        let output = this.outputs[key]
        if (output.id != which) {
          output.element.classList.add('hidden')
        } else {
          output.element.classList.remove('hidden')
        }
      }
      // activate the tab
      for (var key in this.tabs) {
        let tab = this.tabs[key]
        if (tab.id != which) {
          tab.element.classList.add('inactive')
        } else {
          tab.element.classList.remove('inactive')
        }
      }
    }
    
    tabSwitch(datum) {
      let which = datum.detail.replace('rwc-tab-' + this.uuid + '-', '')
      this.activate(which)
    }

    userTyping(datum) {
      let r    = datum.detail
      let id   = r.id
      let user = r.user

      let f = this.users.filter(person => person.id == id)
      if (f.length <= 0) { 
        f = this.addPerson(r)
      } else {
        f = f[0]
      }
      f.state = 'typing'
      this.updateStatus()
    }

    userStopped(datum) {
      let r    = datum.detail
      let id   = r.id
      let user = r.user
      
      let f = this.users.filter(person => person.id == id)
      if (f.length <= 0) { return }
      f[0].state = ''
      this.updateStatus()
    }
    
    cycleCommands(direction, e) {
      if (document.getSelection().toString() !== this.input.value) { return }
      e.preventDefault()
      let m = this.commands.indexOf(this.input.value)
      if (direction == 'up') {
        if (m > 0) {
          m -= 1
          this.input.value = this.commands[m]
          this.input.select()
        }
      } else if (direction == 'down') {
        if (m < this.commands.length - 1) {
          m += 1
          this.input.value = this.commands[m]
          this.input.select()
        }
      }
    }

    modifyRender() {
      let t  = `<div class='rwc-arrow-left  invalid'  onclick='raiseEvent(document.querySelector("body"), "${this.events.arrowLeft}",  "${this.uuid}")'></div> `
          t += `<div class='rwc-arrow-right' onclick='raiseEvent(document.querySelector("body"), "${this.events.arrowRight}", "${this.uuid}")'></div>`

      // modify validity based on wrap
      let wrapped = document.querySelector(`#rwc-tabs-anchor-${this.uuid}`).offsetTop
      let parent  = document.querySelector(`#rwc-tabs-${this.uuid}`).offsetHeight
      if (wrapped <= parent) { 
        t = t.replace('rwc-arrow-right','rwc-arrow-right invalid')
      }
      	
      // Fastdom
      if (fastdom) {
        fastdom.measure(() => {
          fastdom.mutate(() => {
            document.querySelector('#rwc-tabs-navigator-' + this.uuid).insertAdjacentHTML('beforeend', t)
          })
        })
      } else {
        document.querySelector('#rwc-tabs-navigator-' + this.uuid).insertAdjacentHTML('beforeend', t)
      }
    }

    // UX Functions
    
    updateStatus() {
      // updating status for users
      let m = ''
      let f = this.users.filter(user => user.state == 'typing')
      if (f.length > 3) {
        m = 'Several users are typing...'
      } else if (f.length == 3) {
        m = f[0].name + ', ' + f[1].name + ', and 1 other are typing...'
      } else if (f.length == 2) {
        m = f[0].name + ' and ' + f[1].name + ' are typing...'
      } else if (f.length == 1) {
        m = f[0].name + ' is typing...'
      }
      let g = document.querySelector('.rwc-footer-status')
      // Fastdom
      if (fastdom) {
        fastdom.measure(() => {
          fastdom.mutate(() => {
            g.innerHTML = ''
            g.insertAdjacentHTML('beforeend', m)
          })
        })
      } else {
        g.innerHTML = ''
        g.insertAdjacentHTML('beforeend', m)
      }
    }

    arrowLeft() {
      let invisibles = document.querySelectorAll(`#rwc-tabs-${this.uuid} .rwc-tab.subtab.invisible`)
      if (invisibles.length > 0) {
        // make the last one visible again
        let last = invisibles[invisibles.length - 1]
        last.classList.remove('invisible')
      }
      if (invisibles.length <= 1) {
        // deactivate the left arrow button
        document.querySelector(`#rwc-tabs-navigator-${this.uuid} .rwc-arrow-left`).classList.add('invalid')
        // hide the continuation again
        document.querySelector(`#rwc-tabs-continuation-left-${this.uuid}`).classList.add('invisible')
      }
      
      let wrapped = document.querySelector(`#rwc-tabs-anchor-${this.uuid}`).offsetTop
      let parent  = document.querySelector(`#rwc-tabs-${this.uuid}`).offsetHeight
      if (wrapped <= parent) { 
        // activate the left arrow button
        // document.querySelector(`#rwc-tabs-navigator-${this.uuid} .rwc-arrow-left`).classList.remove('invalid')
      } else {
        // ensure the right arrow button is active
        document.querySelector(`#rwc-tabs-navigator-${this.uuid} .rwc-arrow-right`).classList.remove('invalid')
      }
    }

    arrowRight() {
      let wrapped = document.querySelector(`#rwc-tabs-anchor-${this.uuid}`).offsetTop
      let parent  = document.querySelector(`#rwc-tabs-${this.uuid}`).offsetHeight
      if (wrapped <= parent) { 
        // deactivate the right arrow button
        document.querySelector(`#rwc-tabs-navigator-${this.uuid} .rwc-arrow-right`).classList.add('invalid')
        // console.log('No wrapped line; do not make any more elements invisible.'); 
        return }

      let firstVisible = document.querySelector(`#rwc-tabs-${this.uuid} .rwc-tab.subtab:not(.invisible)`)
      if (firstVisible) {
        firstVisible.classList.add('invisible')
        // if the continuation is not visible, make it visible
        document.querySelector(`#rwc-tabs-continuation-left-${this.uuid}`).classList.remove('invisible')
        // recalculate
        wrapped = document.querySelector(`#rwc-tabs-anchor-${this.uuid}`).offsetTop
        if (wrapped <= parent) { 
          // deactivate the right arrow button
          document.querySelector(`#rwc-tabs-navigator-${this.uuid} .rwc-arrow-right`).classList.add('invalid')
        }
        // activate the left arrow button
        document.querySelector(`#rwc-tabs-navigator-${this.uuid} .rwc-arrow-left`).classList.remove('invalid')
      }
    }

    // Functions
    addChannel(data) {
      let id = 'rwc-output-' + this.uuid + '-' + data.identifier
      // add an output box
      let t = `
        <div id='${id}' class='rwc-output subput hidden'>
        </div>
      `
      document.querySelector('#rwc-output-' + this.uuid).insertAdjacentHTML('beforeend', t)
      // add the box to elements array
      this.outputs[id] = {
        id     : data.identifier,
        element: document.querySelector('#' + id),
        buffer : [],
      }
      // add tabs
      id = 'rwc-tab-' + this.uuid + '-' + data.identifier
      t  = `<div id='${id}' 
      onclick='raiseEvent(document.querySelector("body"), "${this.events.tabSwitch}", "${id}")'
      class='rwc-tab subtab inactive'>${data.identifier.substring(0, Math.min(7, data.identifier.length))}</div>`
      if (data.identifier == 'main') {
        document.querySelector('#rwc-tabs-main-' + this.uuid).insertAdjacentHTML('beforeend', t)
      } else {
        document.querySelector('#rwc-tabs-anchor-' + this.uuid).insertAdjacentHTML('beforebegin', t)
      }
      // document.querySelector('#rwc-tabs-' + (data.identifier == 'main' ? 'main-' : '') + this.uuid + ' .').insertAdjacentHTML('beforebegin', t)
      this.tabs[id] = {
        id     : data.identifier,
        element: document.querySelector('#' + id)
      }
    }

    removeChannel(data) {
      // cannot remove main
      if (data.identifier == 'main') { console.log('Cannot remove main.'); return }
      
      let id  = 'rwc-output-' + this.uuid + '-' + data.identifier
      // remove the element
      document.querySelector('#' + id).remove()
      // remove from outputs
      this.outputs[id] = null
      // if the removed channel is the active, shift it to the next
      
    }

    updateChannel() {

    }

    addPerson(user) {
      let f = this.users.filter(person => person.id == user.id)
      if (f.length > 0) {
        console.log('Person already exists.')
        return f[0]
      }
      this.users.push({
           id: user.id,
         name: user.name,
        state: '',
      })
      return this.users[this.users.length - 1]
    }

    removePerson() {

    }

    updatePerson() {

    }
    
    // Broadcast functions
    raiseMessage() {
      // raise message for developer to use
      this.raiseEvent(this.body, this.events.raiseMessage, [this.input.value, this.active])
      // highlight the message
      this.input.select()
      // push into command[] memory
      if (this.commands.length > 0 && this.commands[this.commands.length - 1] == this.input.value) {
        // no need to push
      } else {
        this.commands.push(this.input.value)
      }
      if (this.commands.length > this.commandsLimit) {
        this.commands.shift()
      }
    }

    draggable() {
      let positions = [null,null,null,null]
      let self      = this.self

      let mouseDown = function(e) {
        e = e || window.event
        e.preventDefault()
        positions[2] = e.clientX
        positions[3] = e.clientY
        document.onmouseup = mouseNull
        document.onmousemove = mouseDrag
      }
      let mouseDrag = function(e) {
        e = e || window.event
        e.preventDefault()
        positions[0] = positions[2] - e.clientX
        positions[1] = positions[3] - e.clientY
        positions[2] = e.clientX
        positions[3] = e.clientY
        self.style.top  = (self.offsetTop  - positions[1]) + 'px'
        self.style.left = (self.offsetLeft - positions[0]) + 'px'
      }
      let mouseNull = function() {
        document.onmouseup   = null
        document.onmousemove = null
      }
      // the :not() selector isn't working but we'll roll with this for now
      document.querySelector('#' + 'rwc-header-' + this.uuid + ':not(.rwc-tab)').onmousedown = mouseDown
      document.querySelector('#' + this.self.id + ' .rwc-footer-handler').onmousedown = mouseDown
    }

    static async create(options) {
      /* async stuff here */

      return new RWChatBox(options)
    }
  }

  let simulate = function() {
    
  }

  /* Helper Functions */
  String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  }

  let raiseEvent = function(target, event, datum) { return target.dispatchEvent(new CustomEvent(event, {detail: datum})) };

  let addCSS = function(rule, container, ruleIdentifier) {
    let rc = ruleIdentifier ? ruleIdentifier : CSSIdentifier
    let output = '<div class="' + rc + '" style="display:none;">&shy;<style>' + rule + '</style></div>'
    document.querySelectorAll(rc).forEach(e => e.remove())
    if (container) {
      document.querySelector(container).insertAdjacentHTML('beforeend', output)
    } else {
      document.body.insertAdjacentHTML('beforeend', output)
    }
  }

  let localStorageAvailable = function() {
    var dummy = 'uij-k-test-90k1'
    try {
      localStorage.setItem(dummy, dummy)
      localStorage.removeItem(dummy)
      return true
    } catch(err) {
      return false
    }
  }


  /* Templates */
  let lineTemplate = `
  <div id='rwc-LineID' class='rwc-line rwc-line-UUID'>
    <div class='rwc-line-picture'></div>
    <div class='rwc-line-speaker'>REPLACE_SPEAKER</div><div class='rwc-line-timestamp'>REPLACE_TIMESTAMP</div>
    <div class='rwc-line-message'>REPLACE_MESSAGE</div>
  </div>
  `

  let markupTemplate = `
  <div id='rwc-UUID' class='rwc-container'>
    <div id='rwc-background-UUID' class='rwc-background'></div>
    <div id='rwc-header-UUID'     class='rwc-header'>
       <div id='rwc-tabs-main-UUID' class='rwc-tabs main'></div>
       <div id='rwc-tabs-UUID' class='rwc-tabs residual'><div id='rwc-tabs-continuation-left-UUID' class='rwc-tabs-continuation invisible'>...</div><div id='rwc-tabs-anchor-UUID' class='rwc-tabs-anchor'></div></div>
       <div id='rwc-tabs-navigator-UUID' class='rwc-navigator'>
       </div>
    </div>
    <div id='rwc-output-UUID'     class='rwc-output'></div>
    <div id='rwc-input-UUID'      class='rwc-input' >
       <div class='rwc-footer-status'></div><input></input>
       <div class='rwc-footer-handler'></div>
    </div>
  </div>
  `

  let cssTemplate = `
  @import url('https://fonts.googleapis.com/css2?family=Dosis&family=Poppins:wght@300&display=swap');

  /* RWChatBox */
  .rwc-container {
    position  : absolute;
    height    : ${defaults.height  };
    width     : ${defaults.width   };
    min-height: ${defaults.minHeight};
    min-width : ${defaults.minWidth};
    padding   : ${defaults.padding };
    /* design */
    background   : ${defaults.background  };
    border       : ${defaults.border      };
    border-radius: ${defaults.borderRadius};
    overflow     : hidden;
    /* fonts */
    font-family  : ${defaults.mainFontFamily};
    font-size    : ${defaults.mainFontSize};
    color        : ${defaults.color};
    /* behaviour */
    resize       : both;
  }
  .rwc-background {
    position       : absolute;
    left           : 0%;
    top            : 0%;
    height         : 100%;
    width          : 100%;
    backdrop-filter: blur(9px);
  }
  .rwc-header {
    position     : absolute;
    left         : 0%;
    top          : 0%;
    height       : calc(${defaults.headerHeight} + 1px);
    width        : 100%;
    /* fonts */
    font-size    : ${defaults.headerFontSize};
    color        : ${defaults.headerFontColor};
    /* style */
    overflow     : hidden;
  }
  .rwc-output {
    position     : absolute;
    left         : 0%;
    top          : calc(${defaults.headerHeight} + 1px);
    height       : calc(100% - ${defaults.headerHeight} - ${defaults.inputHeight});
    width        : 100%;
    /* fonts */
    font-size    : ${defaults.outputFontSize};
    color        : ${defaults.outputFontColor};
  }
  .rwc-input {
    position     : absolute;
    left         : 0%;
    bottom       : 0%;
    height       : ${defaults.inputHeight};
    width        : 100%;
    /* style */
    /* border-top   : 1px solid rgba( 144, 144, 144, 1.00 ); */
  }
  .rwc-input input {
    position     : absolute;
    bottom       : ${defaults.inputBottom};
    height       : ${defaults.inputBoxHeight};
    width        : calc(100% - ${defaults.lineLeftPadding} * 2);
    margin-left  : ${defaults.lineLeftPadding};
    margin-right : ${defaults.lineLeftPadding};
    /* reset style */
    border       : none;
    outline      : none;
    padding-left : ${defaults.inputPadding};
    padding-right: ${defaults.inputPadding};
    /* fonts */
    font-size    : ${defaults.inputFontSize};
    color        : ${defaults.inputFontColor};
    /* style */
    color        : ${defaults.inputFontColor};
    background   : ${defaults.inputBackground};
    line-height  : ${defaults.inputBoxHeight};
    border-radius: ${defaults.inputRadius};
  }
  .rwc-input input:focus {
    color        : ${defaults.inputFontColorFocus};
    background   : ${defaults.inputBackgroundFocus};
  }
  .rwc-output.subput {
    top          : 0%;
    height       : 100%;
    overflow     : hidden;
    overflow-y   : scroll;
    background   : ${defaults.outputActiveColor};
  }
  .rwc-output.subput.hidden {
    display      : none;
  }
  
  .rwc-line {
    padding-top   : ${defaults.lineTopPadding};
    padding-bottom: ${defaults.lineBottomPadding};
  }
  .rwc-line:hover {
    background    : rgba( 255, 255, 255, 0.06 );
  }
  .rwc-line-speaker,
  .rwc-line-timestamp {
    display       : inline-block;
    font-size     : ${defaults.speakerFontSize};
  }
  .rwc-line-speaker {
    padding-left  : ${defaults.lineLeftPadding};
    padding-right : ${defaults.lineRightPadding};
    color         : ${defaults.lineSpeakerColor};
  }
  .rwc-line-timestamp {
    color         : ${defaults.lineTimestampColor};
  }
  .rwc-line-message {
    padding-left  : ${defaults.lineLeftPadding};
  }
  
  .rwc-tabs {
    position      : absolute;
    top           : calc(100% - ${defaults.tabHeight});
    height        : ${defaults.tabHeight};
    width         : calc(100% - ${defaults.tabLeftPadding} * 2);
    /* margin-left   : ${defaults.tabLeftPadding}; */
    /* margin-right  : ${defaults.tabLeftPadding}; */
  }
  .rwc-tabs.main {
    left          : 0%;
  }
  .rwc-tabs.residual {
    left          : ${defaults.tabsWidth};
    width         : calc(100% - ${defaults.tabLeftPadding} * 2 - ${defaults.tabsWidth} - ${defaults.tabsNavigatorWidth});
  }
  .rwc-tab,
  .rwc-tabs-continuation {
    position      : relative;
    display       : inline-block;
    width         : ${defaults.tabsWidth};
    height        : 100%;
    /* fonts */
    text-align    : center;
    font-size     : ${defaults.tabsFontSize};
    color         : ${defaults.tabsFontColor};
    line-height   : ${defaults.tabHeight};
    /* behaviour */
    cursor        : pointer;
    user-select   : none;
  }
  .rwc-tab {
    /* design */
    border-top    : 1px solid ${defaults.tabsBorderColor};
    border-right  : 1px solid ${defaults.tabsBorderColor};
    border-top-right-radius: 6px;
    background    : ${defaults.outputActiveColor};
  }
  .rwc-tab:hover {
    color         : ${defaults.tabsFontColorHighlighted};
  }
  .rwc-tab.inactive {
    background    : ${defaults.tabsInactiveColor};
  }
  .rwc-tab.invisible {
    display       : none;
  }
  .rwc-tab.inactive:hover {
    background    : ${defaults.tabsInactiveHoverColor};
  }
  .rwc-tabs-anchor {
    position      : relative;
    display       : inline-block;
  }
  .rwc-tabs-continuation {
    width         : ${defaults.tabsContinuationWidth};
    border-top    : 1px solid ${defaults.tabsBorderColor};
    background    : ${defaults.tabsInactiveColor};
  }
  .rwc-tabs-continuation.invisible {
    display       : none;
  }
  
  .rwc-navigator {
    position      : absolute;
    right         : 0%;
    top           : calc(100% - ${defaults.tabHeight});
    height        : ${defaults.tabHeight};
    width         : calc(${defaults.arrowSize} * 1.5 * 2);
  }
  .rwc-arrow-right,
  .rwc-arrow-left  {
    position     : relative;
    top          : 25%;
    left         : -18%;
    display      : inline-block;
    width        : 0;
    height       : 0;
    border-top   : ${defaults.arrowSize} solid transparent;
    border-bottom: ${defaults.arrowSize} solid transparent;
    /* style */
    cursor       : pointer;
  }
  .rwc-arrow-right {
    border-left  : ${defaults.arrowSize} solid ${defaults.arrowColor};
  }
  .rwc-arrow-left {
    border-right : ${defaults.arrowSize} solid ${defaults.arrowColor};
  }
  .rwc-arrow-right:hover {
    border-left  : ${defaults.arrowSize} solid ${defaults.arrowColorActive};
  }
  .rwc-arrow-left:hover {
    border-right : ${defaults.arrowSize} solid ${defaults.arrowColorActive};
  }
  .rwc-arrow-right.invalid {
    border-left  : ${defaults.arrowSize} solid ${defaults.arrowColorInvalid};
  }
  .rwc-arrow-left.invalid  {
    border-right : ${defaults.arrowSize} solid ${defaults.arrowColorInvalid};
  }
  
  .rwc-footer-status {
    position      : absolute;
    top           : 0%;
    left          : 0%;
    width         : calc(100% - ${defaults.lineLeftPadding} * 2);
    margin-left   : ${defaults.lineLeftPadding};
    margin-right  : ${defaults.lineLeftPadding};
    height        : calc(100% - ${defaults.inputBoxHeight});
    color         : ${defaults.statusFontColor};
  }
  .rwc-footer-handler {
    position      : absolute;
    bottom        : 0%;
    left          : 0%;
    width         : ${defaults.lineLeftPadding};
    height        : ${defaults.inputBoxHeight};
  }
  `

  // Expose raiseEvent if does not exist
  if (!window.raiseEvent) {
    window.raiseEvent = raiseEvent
  }

  return {
    new: RWChatBox.create,
  }
})()
