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
    typingTimeout   : 6 * 1000, // seconds
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
    left            : '0%',
    top             : '0%',
    right           : '0%',
    bottom          : '0%',
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
    whoWidth        : '5ch',
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
    inputHeight     : '6.3vh',
    inputBoxHeight  : '4.1vh',
    inputBottom     : '0.4ch',
    inputPadding    : '0.4em',
    inputBackground : 'rgba( 255, 255, 255, 0.03)',
    inputBackgroundFocus: 'rgba( 255, 255, 255, 0.13)',
    inputRadius     : '4px',
    inputFontSize   : '11pt',
    inputFontColor  : 'rgba( 211, 211, 211, 1.00)',
    inputFontColorFocus: 'rgba( 255, 255, 255, 1.00)',
    inputRightPadding  : '5.5ch',
    // Line
    speakerFontSize   : '9pt',
    lineTopPadding    : '0.2em',
    lineBottomPadding : '0.2em',
    lineLeftPadding   : '30px',
    lineRightPadding  : '1.2ch',
    lineSpeakerColor  : 'rgba( 201, 201, 201, 1.00)',
    lineTimestampColor: 'rgba( 101, 101, 101, 1.00)',
    statusFontColor   : 'rgba( 121, 121, 121, 1.00)',
    
    arrowEnterSize      : '8px',
    arrowEnterDimensions: '5ch',
    arrowEnterColor     : 'rgba( 167, 167, 167, 0.40)',
    arrowEnterHoverColor: 'rgba( 167, 167, 167, 1.00)',

    userLineHeight      : '3.2ch',
  }
  let peopleIcon = 'data:image/png;base64,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'

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
    startTyping    : 'rw-start-typing-UUID',
    stopTyping     : 'rw-stop-typing-UUID',
  }
  // In-memory variables
  // Computational variables
  let UUIDRegex = /UUID/g
  

  class RWChatBox {
    constructor(options) {
      this.outputs   = {}
      this.tabs      = {}
      this.users     = []
      this.roles     = []
      this.commands  = []
      this.previousText = ''

      // Helper function
      this.raiseEvent = raiseEvent
      this.addCSS     = addCSS
      this.getUUID    = defaults.uuid

      // settings
      this.defaultChannel  = !options ? defaults.defaultChannel  : options?.defaultChannel  ? options?.defaultChannel  : defaults.defaultChannel
      this.commandsLimit   = !options ? defaults.commandsLimit   : options?.commandsLimit   ? options?.commandsLimit   : defaults.commandsLimit
      this.scrollbackLimit = !options ? defaults.scrollbackLimit : options?.scrollbackLimit ? options?.scrollbackLimit : defaults.scrollbackLimit
      this.typingTimeout   = !options ? defaults.typingTimeout   : options?.typingTimeout   ? options?.typingTimeout   : defaults.typingTimeout

      // computational
      this.typingTimer;

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
      // insert Markup
      this.parent.insertAdjacentHTML('beforeend', this.markup)
      // accessor for self
      this.self = document.querySelector('#rwc-' + this.uuid)

      // add channels from options
      let channels = !options ? defaults.channels : options?.channels ? options?.channels : defaults.channels
      if (channels.indexOf('who')  == -1) { channels.unshift('who' ) }
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
      
      // adjust X, Y, custom CSS
      let vertical, horizontal;
      if (options && options?.bottom) {
        vertical = `bottom : ${options.bottom};`
      } else {
        vertical = `top    : ${!options ? defaults.top : options?.top ? options?.top : defaults.top};`
      }
      if (options && options?.right) {
        horizontal = `right : ${options.right};`
      } else {
        horizontal = `left  : ${!options ? defaults.left : options?.left ? options?.left : defaults.left};`
      }
      this.addCSS(`
        #rwc-${this.uuid} {
          ${vertical}
          ${horizontal}
          height: ${!options ? defaults.height: options?.height ? options?.height: defaults.height};
          width : ${!options ? defaults.width : options?.width  ? options?.width : defaults.width };
          min-width: ${!options ? defaults.minWidth : options?.minWidth ? options?.minWidth : defaults.minWidth };
        }
      `, '#rwc-' + this.uuid, this.cssIdentifier)
 
      /* Eventify */
      // Start listening
      this.listen()

      // make draggable
      if (options && typeof options.draggable != 'undefined' && options?.draggable == false) {
        // not draggable
      } else {
        this.draggable(this)
      }
    }

    /* Eventification */
    unlisten() {
      let body = document.querySelector('body')
      body.removeEventListener(this.events['receiveMessage'], this.receiveMessage.bind(this))
      body.removeEventListener(this.events['receiveData'], this.processData.bind(this))
      body.removeEventListener(this.events['userTyping'], this.userTyping.bind(this))
      body.removeEventListener(this.events['userStopped'], this.userStopped.bind(this))
      body.removeEventListener(this.events['tabSwitch'], this.tabSwitch.bind(this))
      body.removeEventListener(this.events['arrowLeft'], this.arrowLeft.bind(this))
      body.removeEventListener(this.events['arrowRight'], this.arrowRight.bind(this))
    }

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
            let n = this.input.value.length
            if (n > 0) {
              this.typingStatus()
            } else if (this.previousText.length == 1 && n == 0) {
              this.resetTyping()
            }
            this.previousText = this.input.value
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
        // resize background and reblur - this doesn't work properly
        let bg = document.querySelector(`#rwc-background-${this.uuid}`)
        // Fastdom
        if (fastdom) {
         fastdom.measure(() => {
          fastdom.mutate(() => {
            bg.style.backdropFilter = 'blur(9px)'
            bg.style.width  = this.self.style?.width
            bg.style.height = this.self.style?.height
          })
         })
        } else {
          bg.style.backdropFilter = 'blur(9px)'
          bg.style.width  = this.self.style?.width
          bg.style.height = this.self.style?.height
        }

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
           if (delta > (mainTab.width + dotsTab.width * 1.1)) {
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

      // add user if not existing
      this.addPerson({
          id: r.userID,
        name: r.user,
      })
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
          if (which == 'who') {
            this.showUsers()
          }
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
    
    typingStatus() {
      let previousTime;
      if (typeof this.typingTimer == 'undefined' || this.typingTimer == 0) {
        this.typingTimer = new Date().getTime()
        this.raiseEvent(this.body, this.events.startTyping)
      } else {
        previousTime = this.typingTimer
        this.typingTimer = new Date().getTime()
      }
      if ((this.typingTimer - previousTime) > this.typingTimeout) {
        this.resetTyping()
      }
    }

    resetTyping() {
      this.typingTimer = 0
      this.raiseEvent(this.body, this.events.stopTyping)
    }

    userTyping(datum) {
      let r    = datum.detail
      let id   = r.id
      let user = r.name

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
      let user = r.name
      
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
      
      // Input enter
      let g = document.querySelector(`#rwc-input-${this.uuid} .rwc-arrow-enter`)
      g.onclick = this.raiseMessage.bind(this)

      // modify minimise button
      let m = document.querySelector(`#rwc-${this.uuid} .rwc-minimise`)
      m.onclick = function() {
        this.toggleMinimise()
      }.bind(this)
      m.oncontextmenu = function() {
        this.toggleMinimise(true)
        return false;
      }.bind(this)
      	
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
    toggleMinimise(alternate) {
      if (this.unminimisedState) {
        this.self.style.height = this.unminimisedState
        if (typeof this.alternated != 'undefined') {
          this.self.style.top = this.alternated
          this.self.style.bottom = 'auto'
        }
        delete this.unminimisedState
        delete this.alternated
      } else {
        let style = window.getComputedStyle( this.self )
        let min   = style.minHeight

        this.unminimisedState = style.height
        this.alternated       = style.top

        let bottom = style.bottom
        if (alternate) {
          // Fastdom
          if (fastdom) {
           fastdom.measure(() => {
            fastdom.mutate(() => {
              this.self.style.top    = 'auto'
              this.self.style.bottom = bottom
            })
           })
          } else {
            this.self.style.top    = 'auto'
            this.self.style.bottom = bottom
          }
        }  

        // Fastdom
        if (fastdom) {
         fastdom.measure(() => {
          fastdom.mutate(() => {
            this.self.style.height = min
          })
         })
        } else {
          this.self.style.height = min
        }
      }
    }
    
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
      let i = data.identifier.substring(0, Math.min(7, data.identifier.length))
      if (data.identifier == 'who') {
        i = `<img src=${peopleIcon}></img>`
      }
      t  = `<div id='${id}' 
      onclick='raiseEvent(document.querySelector("body"), "${this.events.tabSwitch}", "${id}")'
      class='rwc-tab subtab inactive'>${i}</div>`
      if (data.identifier == 'main') {
        document.querySelector('#rwc-tabs-main-' + this.uuid).insertAdjacentHTML('beforeend', t)
      } else if (data.identifier == 'who') {
        document.querySelector('#rwc-tabs-who-' + this.uuid).insertAdjacentHTML('beforeend', t)
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
        // console.log('Person already exists.')
        return f[0]
      }
      this.users.push({
           id: user.id,
         name: user.name,
        state: '',
      })
      // update outputs if active is WHO
      if (this.active == 'who') {
        this.showUsers()
      }
      return this.users[this.users.length - 1]
    }

    removePerson() {

    }

    updatePerson() {

    }
 
    showUsers() {
      let element = document.querySelector(`#rwc-output-${this.uuid}-who`)
      // collate the data
      let output = ''
      let template = `<div id='rwc-user-${this.uuid}-USERID' class='rwc-user'><div class='rwc-user-name'>NAME</div></div>`
      this.users.forEach(user => {
        output += template.replace('USERID', user.id).replace('NAME', user.name)
      })
      // display it
      // Fastdom
      if (fastdom) {
        fastdom.measure(() => {
          fastdom.mutate(() => {
            // wipe the output
            element.innerHTML = output
          })
        })
      } else {
        element.innerHTML = output
      }
    }
    
    // Broadcast functions
    raiseMessage() {
      // raise message for developer to use
      this.raiseEvent(this.body, this.events.raiseMessage, [this.input.value, this.active == 'who'? 'main' : this.active])
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
      // send a stopped-typing signal
      this.resetTyping()
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

    remove() {
      this.unlisten() // this doesn't work well 
      this.resizeObserver.disconnect()
      document.querySelector('#rwc-' + this.uuid).remove()
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
       <div id='rwc-tabs-who-UUID' class='rwc-tabs who'></div>
       <div id='rwc-tabs-main-UUID' class='rwc-tabs main'></div>
       <div id='rwc-tabs-UUID' class='rwc-tabs residual'><div id='rwc-tabs-continuation-left-UUID' class='rwc-tabs-continuation invisible'>...</div><div id='rwc-tabs-anchor-UUID' class='rwc-tabs-anchor'></div></div>
       <div id='rwc-tabs-navigator-UUID' class='rwc-navigator'>
       </div>
       <div id='rwc-header-minimise-UUID' class='rwc-minimise'></div>
    </div>
    <div id='rwc-output-UUID'     class='rwc-output'></div>
    <div id='rwc-input-UUID'      class='rwc-input' >
       <div class='rwc-footer-status'></div><input></input>
       <div class='rwc-footer-handler'></div>
       <div class='rwc-arrow-enter'>
         <div class='rwc-arrow-enter-top'></div>
         <div class='rwc-arrow-enter-bottom'></div>
       </div>
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
    width        : calc(100% - ${defaults.lineLeftPadding} - ${defaults.inputRightPadding});
    margin-left  : ${defaults.lineLeftPadding};
    margin-right : ${defaults.inputRightPadding};
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
    padding-right : ${defaults.lineRightPadding};
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
    left          : ${defaults.whoWidth};
  }
  .rwc-tabs.who .rwc-tab {
    width         : ${defaults.whoWidth};
  }
  .rwc-tabs.who .rwc-tab img {
    width         : calc(0.46 * ${defaults.whoWidth});
    height        : calc(0.46 * ${defaults.whoWidth});
    position      : absolute;
    top           : 50%;
    left          : 50%;
    transform     : translate( -50%, -50% );
    filter        : invert(0.56) opacity(0.78);
  }
  .rwc-tabs.residual {
    left          : calc(${defaults.whoWidth} + ${defaults.tabsWidth});
    width         : calc(100% - ${defaults.tabLeftPadding} * 2 - ${defaults.tabsWidth} - ${defaults.whoWidth} - ${defaults.tabsNavigatorWidth});
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
  .rwc-minimise {
    position     : absolute;
    top          : 0.1ch;
    right        : 4ch;
    height       : 0.9ch;
    width        : 2.4ch;
    background   : rgba(   1,   1,   1, 0.18 );
    /* style */
    cursor       : pointer;
    transition   : all 140ms;
    border-bottom: 1px solid rgba( 255, 255, 255, 0.15 );
    border-bottom-left-radius : 2px;
    border-bottom-right-radius: 2px;
  }
  .rwc-minimise:hover {
    background   : rgba( 101, 101, 101, 0.45 );
    border-bottom: 1px solid rgba(   1,   1,   1, 0.45 );
  }
  
  .rwc-arrow-enter {
    position     : absolute;
    top          : calc(0.8*(100% - ${defaults.inputBoxHeight}) + ${defaults.inputBoxHeight}/2);
    right        : 0px;
    height       : ${defaults.arrowEnterDimensions};
    width        : ${defaults.arrowEnterDimensions};
    border-radius: 3px;
    background   : rgba( 255, 255, 255, 0.00 );
    transform    : translate( 0%, -50% );
    transition   : all 140ms;
    /* style */
    cursor       : pointer;
  }
  .rwc-arrow-enter-top,
  .rwc-arrow-enter-bottom  {
    position     : absolute;
    left         : 50%;
    top          : 50%;
    width        : 0;
    height       : 0;
  }
  .rwc-arrow-enter-top {
    transform    : translate( -50%, -101% );
    border-top   : ${defaults.arrowEnterSize} solid transparent;
    border-left  : ${parseInt(defaults.arrowEnterSize.replace('px','')) * 1.88 + 'px'} solid ${defaults.arrowEnterColor};
  }
  .rwc-arrow-enter-bottom {
    transform    : translate( -50%,   11% );
    border-bottom: ${defaults.arrowEnterSize} solid transparent;
    border-left  : ${parseInt(defaults.arrowEnterSize.replace('px','')) * 1.88 + 'px'} solid ${defaults.arrowEnterColor};
  }
  .rwc-arrow-enter:hover .rwc-arrow-enter-top,
  .rwc-arrow-enter:hover .rwc-arrow-enter-bottom {
    border-left  : ${parseInt(defaults.arrowEnterSize.replace('px','')) * 1.88 + 'px'} solid ${defaults.arrowEnterHoverColor};
  }
  .rwc-arrow-enter:hover .rwc-arrow-enter-top {
    transform    : translate( -50%, -101% );
  }
  .rwc-arrow-enter:hover .rwc-arrow-enter-bottom {
    transform    : translate( -50%,   11% );
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

  .rwc-user {
    padding-top   : ${defaults.lineTopPadding};
    padding-bottom: ${defaults.lineBottomPadding};
    padding-left  : ${defaults.lineLeftPadding};
    height        : ${defaults.userLineHeight};
    line-height   : ${defaults.userLineHeight};
  }
  .rwc-user:hover {
    background    : rgba( 255, 255, 255, 0.06 );
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


/*
    typingStatus() {
      if (this.typingTimer) { clearTimeout(this.typingTimer); delete this.typingTimer; } else {
        this.raiseEvent(this.body, this.events.startTyping)
      }
      this.typingTimer = setTimeout(function() {
        this.resetTyping()
      }.bind(this), this.typingTimeout)
    }

    resetTyping() {
      if (this.typingTimer) { clearTimeout(this.typingTimer); delete this.typingTimer; }
      this.raiseEvent(this.body, this.events.stopTyping)
    }
 */
