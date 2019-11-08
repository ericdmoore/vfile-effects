import vfile from 'vfile'

/**
 * @description asdasd
 * @param config 
 * @returns ASd.
 */
export const fileFn = (fs:IFsFileWriter) => (vf:vfile.VFile, i:number, a:vfile.VFile[] ) => {
  return new Promise((resolve, reject) => {
    if(vf.path){
      fs.writeFile( vf.path, vf.toString(), null, (err)=>{
        if (err) reject(`An error has occurred: ${err}`)
        resolve(vf as vfile.VFile) 
      })
    }
    else {
      reject('There was no path available to save the file')
    }
  })
}

// eslint-disable-next-line no-unused-vars
export const requestFn = (fetch: IHttpFetcher) => (params:IfetchConfig, i:number, a: IfetchConfig[]) => {
  //   console.log('made it to httprequest effect handler')
  const { method,headers, body, url } = params
  const opts = {
    ...(method ? { method: method.toString().toLowerCase() } : {}),
    ...(headers ? { headers } : {}),
    ...(body ? { body: JSON.stringify(body) } : {})
  }
  return Object.keys(opts).length > 0 ? fetch(url, opts) : fetch(url)
}

/**
 * @description Asdasd.
 * @param param  - General input object.
 * @returns - transformer function is returned from the attacher function.
 * @example
 * var plugThisIn =  handleVfileEffects()
 */
export function handleVfileEffects (param:{
  fileFn: (vf:vfile.VFile, i:number, a:vfile.VFile[] )=>Promise<vfile.VFile>, 
  requestFn: (params:IfetchConfig, i:number, a: IfetchConfig[])=>Promise<Response>
}) {
  const { fileFn, requestFn } = param

  if (!fileFn && typeof fileFn !== 'function') {
    throw new Error('please configure a consider using the builtIn `fileFn` and passing it in here')
  }
  if (!requestFn && typeof requestFn !== 'function') {
    throw new Error('please consider using the builtIn `requestFn` and passing it in here')
  }

  console.log('handle Effects Attacher', { fileFn, requestFn })
  const path_ = path('.')

  return function transformer (tree:any, file:any) {
    console.log('Transformer: Handling Effects  - found data of:', file.data)
    const { httpRequests, newFiles } = path_('data.vfileEffects')(file) || {} as {httpRequests?: IpluginPackage[], newFiles?:IpluginPackage[] }
    const ret : {responses: any, files:any} = {responses:'', files:''}

    if (httpRequests) {
      ret['responses'] = httpRequests.map((pluginPkg: IpluginPackage) => {
        //   console.log({ pluginPkg })
        return pluginPkg.after(Promise.all((pluginPkg.init as IfetchConfig[]).map(requestFn)), pluginPkg.pluginName)
      })
    }
    if (newFiles) {
      ret['files'] = newFiles.map((pluginPkg: IpluginPackage) => {
        //   console.log({ pluginPkg })
        return pluginPkg.after(Promise.all((pluginPkg.init as vfile.VFile[]).map(fileFn)), pluginPkg.pluginName)
      })
    }
    console.log({ ret })
    return ret
  }
}

/**
 * @description a generalized effect builder function
 * @param type -Asd.
 * @param data -Asd.
 * @param data.init -Asd.
 * @param data.after -Asd.
 * @returns File -Asd.
 * @example
 * // build the httpRequestFx function
 * var addHttpRequestFx = ({init, after}) => file => {
 *   return addEffect('http', {init, after})(file)
 * }
 */
export const addEffect = (type:'fs'|'http' , data:IpluginPackage) => (file:vfile.VFile) => {
  
  const path_ = path('.')

  const isValidData = (failure:Function) => (_type:string, validationData: IpluginPackage) => {
    // validator helpers
    //  console.log({ _type, validationData })
    const allfilesArevFiles = function<T>(input:T[]){ return input.every((d:T) => d instanceof vfile)}
    const allObjHaveUrlandCorrectMethod = function(input:IfetchConfig[]){
      return input.every((d:IfetchConfig) =>
        'url' in d && 'method' in d
          ? ['get', 'put', 'post', 'options', 'delete'].includes(d.method.toString().toLowerCase())
          : true
      )
    }
    // validation rules are based on the validation "type"
    switch (_type) {
      case 'fs':
        return allfilesArevFiles(validationData.init as vfile.VFile[]) ? validationData : failure(validationData)
      case 'http':
        return allObjHaveUrlandCorrectMethod(validationData.init as IfetchConfig[])
          ? validationData
          : failure(validationData)
    }
  }

  // configure validator
  // inject failure function
  const throwIfNotValid = isValidData((data:IpluginPackage) => {
    console.error(`a problem occured due to: ${JSON.stringify(data)}`)
    throw new Error('the data did not match the input type')
  })

  // affect the file.data
  // set the delayed effect (pure)
  // business logic
  file.data = {
    ...file.data as {},
    vfileEffects: {
      ...('vfileEffects' in (file.data as {}) ? (file.data as {vfileEffects:{}}).vfileEffects : {}),
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
  return file
}

//
// Construct useful functions from the more abstract builder
//
export const addHttpRequestFx = (inputs:{ init:IfetchConfig[], pluginName: string, after:Function }) => (file:vfile.VFile) => addEffect('http', inputs)(file)
export const addNewFileFx = (inputs:{ init:vfile.VFile[], pluginName: string, after:Function }) => (file:vfile.VFile) => addEffect('fs', inputs)(file)
export const addFx = (inconfigData: {http: IpluginPackage, fs: IpluginPackage}) => (file:vfile.VFile) => {
  const { http, fs } = inconfigData
  return addEffect('http', http)(
    addEffect('fs', fs)(file)
  )
}

//
// UTILS
//
export const path = (delim = '.') => (pathsegments: string | string[]) => (dataIn: any): any => {
  if (!dataIn) return undefined
  let nextSegment :string | undefined
  if (typeof pathsegments === 'string') {
    pathsegments = pathsegments.split(delim)
  } else if (!( 
    Array.isArray(pathsegments) &&
    pathsegments.length > 0 &&
    typeof pathsegments[0] === 'string'
    )){
    console.error(`expecting a string or string[] instead got: ${pathsegments}`)
    throw new Error(`path segments should be delimeted string or string[]`)
  }

  // only excpecting arrays by here
  if (pathsegments.length > 1) {
    nextSegment = pathsegments.shift()
    return dataIn[nextSegment || '-1'] ? path(delim)(pathsegments)(dataIn[nextSegment as string]) : undefined
  }
  return pathsegments[0] in dataIn ? dataIn[pathsegments[0]] : undefined
}

export interface IFsFileWriter{
  writeFile : (
    path: string,
    data: any,
    options?: { encoding?: string | null; mode?: number | string; flag?: string; } | string | null,
    callback?: (err: NodeJS.ErrnoException | null) => void
  ) => void
}

export type IHttpFetcher = (url: RequestInfo,init?: RequestInit)=> Promise<Response>;

export interface IfetchConfig{ 
  url: string 
  body:string
  method:string
  headers: Json | {[k:string]:Function} 
} 
export interface IpluginPackage{
  pluginName: string
  init: IfetchConfig[] | vfile.VFile[]
  after: Function
}

export type Json =
    | string
    | number
    | boolean
    | null
    | { [k: string]: Json }
    | Json[]