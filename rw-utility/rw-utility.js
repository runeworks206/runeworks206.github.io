
runeworks = typeof runeworks != 'undefined' ? runeworks : {}

runeworks.utility = (function() {

  /* Extracts numbers provided in an alphanumeric string in a contiguous fashion */
  let clean = function(n) { if (typeof n !== 'string') { return n }; return Number(n.replace(/[^-\d\.]/g,'')) }

  /* Copies any object deeply */
  let clone = function(obj) {
      let copy
      if (null == obj || 'object' != typeof obj) { return obj }
      if (obj instanceof String) { return (' ' + obj).slice(1) }  /* https://stackoverflow.com/a/31733628 */
      if (obj instanceof Date) { return new Date().setTime(obj.getTime()) }
      if (obj instanceof Array) {
         copy = []
         for (let i = 0; i < obj.length; i++) { copy[i] = clone(obj[i]) }
         return copy
      }
      if (obj instanceof Object) {
         copy = {}
         for (let attr in obj) { if (obj.hasOwnProperty(attr)) { copy[attr] = clone(obj[attr]) } }
         return copy
      }
      throw new Error('Unable to copy obj! Type not supported.')
  }
  
  /* https://stackoverflow.com/a/2901298 */
  /* Inserts commas per 3 digits */
  let commaThis = function(n) { 
      let parts = n.toString().split('.')
      parts[0]  = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,',')
      return parts.join('.') }
  
  /* Calculate time between two Date() objects */
  let interval = function(a, b) {
      if (!a) { return false }
      var a = a
      var b = b || new Date()
      if (b > a) { b = [a, a = b][0] } // swap variable contents
      let diff  = a.getTime() - b.getTime()
      let msecs = diff % 1000
      let secs  = Math.floor(diff / 1000)
      let mins  = Math.floor(secs / 60)
          secs  = secs % 60
      let hrs   = Math.floor(mins / 60)
          mins  = mins % 60
      let days  = Math.floor(hrs  / 24)
           hrs  =  hrs % 24
      return {milliseconds: msecs, seconds: secs, minutes: mins, hours: hrs, days: days}
  }
  
  /* Retrieve the key that maps to a provided value */
  let key = function(obj, v) { for (var prop in obj) { if (obj.hasOwnProperty(prop)) { if (obj[prop] === v) { return prop } } } }

  /* Rounds numbers */
  let round = function(num, scale) {
      if (!('' + num).includes('e')) { 
        return + (Math.round(num + 'e+' + scale) + 'e-' + scale)
      } else {
        let arr = ('' + num).split('e')
        return + (Math.round(+arr[0] + 'e' + ((+arr[1] + scale > 0) ? '+' : '') + (+arr[1] + scale)) + 'e-' + scale)
      }
  }

  /* https://stackoverflow.com/a/1584377 */
  /* Compresses array by dropping sequential repeats */
  let uniqueArray = function(arr) { 
      let a = arr.concat()
      for (let i = 0; i < a.length; ++i) {
        for (let j = i+1; j < a.length; ++j) {
          if (a[i] === a[j]) { a.splice(j--, 1) }
        }
      }
      return a
  }

  /* Generates unique ID */
  let uuid = function() {
      let d = new Date().getTime()
      if (window.performance && typeof window.performance.now === 'function') { d += performance.now() }
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(v) {
        let r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (v == 'x' ? r : (r&0x3|0x8)).toString(16)
      })
  }
  
  let title = function(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
  }

  /* Custom Sorting */
  /* https://stackoverflow.com/a/27645164 */
  /*
     array.sort(chainSortBy([
       sort_by('name', false, null),
       sort_by('age',  true,  null),
     ]))
   */
  let sort_by = function(field, reverse, primer) {
    var key = primer ? function(x) { return primer(x[field]) } : function(x) { return x[field] };
    reverse = [-1, 1][+!!reverse];
    return function(a, b) {
      a = key(a)
      b = key(b)
      return a==b ? 0 : reverse * ((a > b) - (b > a)); // return a zero if the two fields are equal
    }
  }

  let chainSortBy = function(sortByArr) {
    return function(a, b) {
      for (var i = 0; i < sortByArr.length; i++) {
        var res = sortByArr[i](a,b);
        if (res != 0) {
          return res; // if the individual sort_by returns a non-zero, there is inequality, return the value form the comparator
        }
      }
    }
  }
  
  /* https://stackoverflow.com/a/57015870 */
  /*
     let arr1 = ['A','B','C']
     let arr2 = ['1','2','3']
     console.log(combineArrays([arr1, arr2],'-'))
   */
  let combineArrays = ([head, ....[headTail, ...tailTail]], sep) => {
    if (!headTail) return head
    
    const combined = headTail.reduce((acc, x) => {
      return acc.concat(head.map(h => `${h}${sep ? sep : ''}${x}`))
    }, [])
    
    return combineArrays([combined, ...tailTail], sep)
  }
  
  let combineObjects = ([head, ....[headTail, ...tailTail]]) => {
    if (!headTail) return head
    
    const combined = headTail.reduce((acc, x) => {
      return acc.concat(head.map(h => ({...h, ...x})))
    }, [])
    
    return combineObjects([combined, ...tailTail])
  }
  
  return {
    clean         : clean,
    clone         : clone,
    comma         : commaThis,
    interval      : interval,
    key           : key,
    round         : round,
    uniqueArray   : uniqueArray,
    uuid          : uuid,
    title         : title,
    sort_by       : sort_by,
    chainSort     : chainSortBy,
    combineArrays : combineArrays,
    combineObjects: combineObjects,
  }
})()
