/* eslint-disable jsdoc/check-examples */

/**
 * Do we want to pass in to all the dependencies of the function?
 * I vote why not?
 */

const vfile = require('vfile')
const toVfile = require('to-vfile')

// attempting to isloate dependencies
// figure out how to get the fileFn to acually use the fs
// eslint-disable-next-line no-unused-vars
const fileFn = ({ fs }) => (vf, i, a) => {
  console.log(vf)
  return new Promise(resolve => {
    toVfile.write(vf, () => {
      resolve(vf)
    })
  })
}

// eslint-disable-next-line no-unused-vars
const requestFn = ({ fetch }) => ({ url, body, method, headers }, i, a) => {
  //   console.log('made it to httprequest effect handler')
  const opts = {
    ...(method ? { method: method.toString().toLowerCase() } : {}),
    ...(headers ? { headers } : {}),
    ...(body ? { body: JSON.stringify(body) } : {})
  }
  return Object.keys(opts).length > 0 ? fetch(url, opts) : fetch(url)
}

/**
 * @description Asdasd.
 * @param {Object} param  - General input object.
 * @param {Object} param.opts  - Asd.
 * @param {Function} param.fileFn  - Asd.
 * @param {Function} param.requestFn  - Asd.
 * @returns Function - transformer function is returned from the attacher function.
 * @example
 * var plugThisIn =  handleVfileEffects()
 */
function handleVfileEffects (param) {
  const { fileFn, requestFn } = param
  console.log('handle Effects Attacher', { fileFn, requestFn })

  const path_ = path('.')

  if (!fileFn) {
    throw new Error('please configure a consider using the builtIn `fileFn` and passing it in here')
  }
  if (!requestFn) {
    throw new Error('please consider using the builtIn `requestFn` and passing it in here')
  }

  return function transformer (tree, file) {
    console.log('Transformer: Handling Effects  - found data of:', file.data)
    const { httpRequests, newFiles } = path_('data.vfileEffects')(file) || {}
    const ret = {}

    if (httpRequests) {
      ret['responses'] = httpRequests.map(pluginPkg => {
        //   console.log({ pluginPkg })
        return pluginPkg.after(Promise.all(pluginPkg.init.map(requestFn)), pluginPkg.pluginName)
      })
    }
    if (newFiles) {
      ret['files'] = newFiles.map(pluginPkg => {
        //   console.log({ pluginPkg })
        return pluginPkg.after(Promise.all(pluginPkg.init.map(fileFn)), pluginPkg.pluginName)
      })
    }
    console.log({ ret })
    return ret
  }
}

/**
 * @description a generalized effect builder function
 * @param {string} type -Asd.
 * @param {Object} data -Asd.
 * @param {string[]} data.init -Asd.
 * @param {Function} data.after -Asd.
 * @returns {Function} File -Asd.
 * @example
 * // build the httpRequestFx function
 * var addHttpRequestFx = ({init, after}) => file => {
 *   return addEffect('http', {init, after})(file)
 * }
 */
const addEffect = (type, data) => file => {
  // no need to copy since we are going to affect the input file
  // const file = { ..._file } // copy
  const path_ = path('.')

  const isValidData = failure => (_type, validationData) => {
    // validator helpers
    //  console.log({ _type, validationData })
    const allfilesArevFiles = input => input.every(d => d instanceof vfile)
    const allObjHaveUrlandCorrectMethod = input => {
      return input.every(d =>
        'url' in d && 'method' in d
          ? ['get', 'put', 'post', 'options', 'delete'].includes(d.method.toString().toLowerCase())
          : true
      )
    }
    // validation rules are based on the validation "type"
    switch (_type) {
      case 'fs':
        return allfilesArevFiles(validationData.init) ? validationData : failure(validationData)
      case 'http':
        return allObjHaveUrlandCorrectMethod(validationData.init)
          ? validationData
          : failure(validationData)
    }
  }

  // configure validator
  // inject failure function
  const throwIfNotValid = isValidData(data => {
    console.error(`a problem occured due to: ${JSON.stringify(data)}`)
    throw new Error('the data did not match the input type')
  })

  // affect the file.data
  // set the delayed effect (pure)
  // business logic
  file.data = {
    ...file.data,
    vfileEffects: {
      ...('vfileEffects' in file.data ? file.data.vfileEffects : {}),
      ...(type === 'fs'
        ? {
          newFiles: [
            ...(path_('data.vfileEffects.newFiles')(file) || []),
            throwIfNotValid(type, data)
          ]
        }
        : {}),
      ...(type === 'http'
        ? {
          httpRequests: [
            ...(path_('data.vfileEffects.httpRequests')(file) || []),
            throwIfNotValid(type, data)
          ]
        }
        : {})
    }
  }
  //   console.log(`Adding an Effect from the plugin`, file.data.vfileEffects)
  return file
}

//
// Construct useful functions from the more abstract builder
//

const addHttpRequestFx = ({ init, after }) => file => addEffect('http', { init, after })(file)

const addNewFileFx = ({ init, after }) => file => addEffect('fs', { init, after })(file)

const addFx = inconfigData => file => {
  const { http, fs } = inconfigData
  return addEffect('http', { init: http.init, after: http.after })(
    addEffect('fs', { init: fs.init, after: fs.after })(file)
  )
}

//
// UTILS
//

const path = (delim = '.') => pathsegments => dataIn => {
  if (!dataIn) return undefined
  let nextSegment
  if (typeof pathsegments === 'string') {
    pathsegments = pathsegments.split(delim)
    //  console.log('MAKE path segments an array')
  } else if (
    Array.isArray(pathsegments) &&
    pathsegments.length > 0 &&
    typeof pathsegments[0] === 'string'
  ) {
    //  console.log('ALREADY have pathsegments as array')
  } else {
    console.error(`expecting a string or string[] instead got: ${pathsegments}`)
    throw new Error(`path segments should be delimeted string or string[]`)
  }

  // only excpecting arrays by here
  if (pathsegments.length > 1) {
    nextSegment = pathsegments.shift()
    return nextSegment in dataIn ? path(delim)(pathsegments)(dataIn[nextSegment]) : undefined
  }
  return pathsegments[0] in dataIn ? dataIn[pathsegments[0]] : undefined
}

module.exports = {
  handleVfileEffects,
  addEffect,
  addHttpRequestFx,
  addNewFileFx,
  addFx,
  requestFn,
  fileFn
}
