# vfile Side Effects

If you are already adept with pure & impure fucntions, and side effects; then slide on down to What is vFile-Effects.

## Introduction of Useful Concepts

### "Pure" Functions

When you compute the answer to a function the function is said to be "pure" if the answer, the output,is guarenteed to be the same every time you provide some given inputs. This means no other infromation, or state, can mess up, or effect, the compution; not a database, not the file system, not some Http API holding your data in the cloud.

### Functions with Side Effects

As with pharmaceuticals, generally people take exlirs for the sole purpose of curing some ailment, and a side effect is something else that happens along the way. And with computing, a system generating data other than the answer - such as sending data to facebook, to a database, to your hard drive, or to some other API... is said to be impure, or at least containing side effects. Technically, impure functions are the ones that depend on or require some input not directly given to it, but where it grabs data on its own. Since the grabbing of the data happens somewhere, anywhere really between the start and completion of the function, things can get unweildy rather promptly. 

<!-- more -->

 Thus it's been said that Side effects are the root of many evils in computing. And this lone ideal has furnished a seed that germinated into things like Haskell, Elm, Redux, Hyperapp, and countless other pure function implementations.

Life might be so grand if we only had pure functions. However, the problem is that pure functions usually need to save their answers somewhere. And so it is, side effects, like money, are not scume or even terrible, but rather intrinsicly neutral; merely something to be astutely managed. It is our problematic love of money, or in terms of computing, our love of getting things done with the "quick and dirty" way that causes so many problems.

Side-effects, in fact, are incredibly useful. Imagine telling your boss that she can not compel you to save data to the database any more. After all, that would be so impure... good luck. If you pull this off, we are hiring in sales!

Rather it seems plainly obvious that databi (wouldn't that be fun if it were the plural of database), S3, a redis cache, etc, are all extremely useful tools, and very much impure - or stateful. Saving files to your hard-drive is incredibly useful, the same would be true for every aforementioned example, other than you sending my data to facebook. That is a "purely insidious side-effect", and also the topic for a separate discussion.

So side-effects are not too far from acting like a bad relationship. It can be really nice, at times... and at other times it makes us want to hide. So if we are a bit proacive we can "manage the crazy" and not let it run amuck. Much like when your mother tells you to eat your carrots. They help you become full - direct outcome, and they even have beneficial side-effects of improved eye sight over time. `vfile-effects` aims to create a systematic process for making the most out of system side effects.

## What is vfile-Effects?

Wow, you are quite the reader! Let's keep going. After you still might be trying to figure out what is `vfile-effects` anyway?

`vfile-effects` is a system of _producers_ and _consumers_. That attempts to provide a nicely paved sidewalk. So that functions don't have to get the machete out and blaze a trail through the junglle. it does not prohibt functions from "sending your own data" - it merely attempts to make it really easy to do that in a structured way.

### Standard Usage

So if you are a developer using unifiedjs like this

```javascript
unified().use(somePLugin).process(textString)
```

life will continue on with the one caveat that perhaps one plugin might inform you that it would like to byt has not added a file to your hard drive.

### Plugin Developer

So if you are a developer who has determiend that you need to make a plugin for a unified plugin pipeline you might use things like.

```javascript
const {addEffectFs, addEffectHttp} = require('somefile')
```

These functions attempt to make it too easy. to setup a a modeled side-effects, and just attach it to the file as work yet to be completed.

Plugins can even make effects based on the presence of other effects.

But adding effect data is about transforming single step: "qucik & dirty processes" into two-step : "plain & simple" processes.

#### Just for Review::

_Quick and dirty:_

> your plugin does an `await fetch(url, payload)` and integrates the data.

_Plain and simple_

> your plugin emits a `httpRequest` data element. And then a different plugin, likely one you did not even have to make, picks up that data as a request to make a side-effect and completes it for you.

### Currently Supports Outbound Side Effects

So far the side effects support an "FYI model". The response of the fs, or http fetch - can not be integrated back into the plugin. Again, there are very legitimate cases where you might want to intragrate data from a somewhere else. And so far we only handle data as output - not side-effects as inputs.

For the `Producers` of effects, they produce a bit of data that describes, or models, some desired side-effect. (See managing a bad relationship from the Preamble). This data is attached to the file, and travels along the plugin pipeline as public data.

The `Consumers` are the "would be crazy ones" from our metaphors. They are looking for the data that describes some wanted side effect. And they, like a triggered frenemy, go off and do their thing with reckless abandon; making a file or three, and pinging various http endpoints.

## So vFile Effects Helps with...

> Whoa, whoa, whoa, are you asking me to instead of fs.writeFile(somePath, someData) to have to model that out as some file and then to deal with the "bit of data" they clearly states "I want a new file"?

> Yes, yes indeed.

> But why would any sane person do this? Is it not twice the work?

> Hopefully it is not twice the work (as boilerplate reduction is on the list of goals for this package) - but yes if you imagine how much time you spend debugging not because your function is broken, but because some file was missing or not parsable at the moment - and it restricted your function from running... then you know that if we all collected the side-effects, where your plugin could monitor the side-effects in addition to the inputs- and make some determination... at this point we are back to mostly just writing unit tests. Unit tests are WAY easier than other tests (E2E, integration tests, or anything with mocks that tend to mock me)

## General Principles for vFile Effects

1. Batteries included as much as reasonable. Sane defaults - that double as code examples.
2. Functional libs are challening often because the paradigm is just so different - and then adding insult to injury, you have to configure all these functions where you are not sure of their purpose.

## Installation

`npm i vfile-sideEffects -S`

## Usage

As previously mentioned there are a few parts available for usage:

1. A lib for plugin developers to produce modeled side-effects.
2. A lib for plugin developers to consumer the modeled side-effects.
3. A batteries included plugin that consumes all modeled side-effects at the end of processing and generates the desired effects. (fs:newFile and http:fetch is supported so far)

## Reference Material

1. Guides
2. API Reference
3. Community Chat
4. Examples
5. Andvanced Topics

vFile some processor that splits the content based on the `<!-- more -->` flag.

Adding the `except content` and the `remaining content` as separate files that should be generated but only represented in the `vfile.data` section

## Motivating Example: Mermaidjs

`remark-mermaid-plugin-inline`

### Quickly: What is it?

`remark-mermaid-plugin-inline` is a plugin that generates charts from an easily understood text-syntax for generating SVG charts. Yes, one already exists, but I was hoping for a little more functionality. plus, I wished that it did not assume it could just drop commands on the shell.

### NOTES:

1. Plays nicely with existing mermaid plugins "lang=mermaid" does nothing for this plugin.
2. Assumption: you might want to document your mermaid source AND show its results in one post

### MODES:

3 Regular Modes + a Reverse Mode Compliment for each

1. `mermaid-inline` a pure transform from MD mermaid code block syntax - to inlined html
2. `mermaid-image` transform with more consice syntax - but yielding a new file on disk too - aiding the brevity and svg encapsulation within a file (they can get lengthy quickly)
3. `mermaid-image-inline` or `mermaid-inline-image` has a new file side-effect -and transforms to html
4. `mermaid-image-reverse` changing the class to end in `-reverse` (pure function)
5. `mermaid-inline-reverse` changing the class to end in `-reverse` (pure function)
6. `mermaid-inline-image-reverse` changing the class to end in `-reverse` (pure function)

### PROCESS:

1. Find MD code blocks where lang "mermaid-inline" | "mermaid-image" | "mermaid-inline-image" | *-reverse
2. START: Run the code source through the jsdom/mermaid function
3. Add an html comment with the original mermaid source input
4. Delete the code block
5. END: Add an html div containing the mermaid generated SVG

### How it uses vfile-Side Effects

When it needs to generate the image version of an svg (say for fairly huge SVG images) - the plugin creates a `newFile` bit of data. And then at the end of your plugin chain, be sure to add in the `handleSideEffects` plugin and then the extra image gets created for you on your file system.

### Mode Examples

#### Input1

```mermaid-inline
graph LR
  A-->B
```

#### Output1

<div class="mermaid-inline">
  <comment>
        mermaid-inline
        graph LR
        A --^ B // using carret since lint messes with arrows
  </comment>
  <div class="mermaid">
    //svg code goes here
  </div>
</div>

#### Input2

```mermaid-image
graph LR
  A-->B
```

#### Output2

![Mermaid Chart](./ new file that was created via side effect.svg)

#### Input3

```mermaid-image-inline
graph LR
  A-->B
```

same as

```mermaid-inline-image
graph LR
  A-->B
```

#### Output3

<div class="mermaid-inline-image">
  <comment>
        mermaid-image-inline
        graph LR
        A --^ B
  </comment>
  <div class="mermaid">
  <img alt="mermaid chart" src="/SideEffectFile.svg">
</div>
</div>

#### Input4

add '-reverse' to the class name

NOTE: MODE 4,5,& 6 are reversals

<div class="mermaid-inline-reverse">
  <comment>
        mermaid-inline
        graph LR
        A --^ B // using carret since lint messes with arrows
  </comment>
  <div class="mermaid">
    //tons of svg code goes here
  </div>
</div>

#### Output4

```mermaid-image
graph LR
  A-->B
```

#### Input5

Example:

![Mermaid Chart](./ new file that was created.svg)

NOTE:

looks for MD Image nodes where:

1. 'mermaid' in alt text
2. src is an + '{{hash.length}}.svg'

#### Output5

![Mermaid Chart](./ new file that was created.svg)

#### Input6

<div class="mermaid-inline-image-reverse">
  <comment>
        mermaid-image-inline
        graph LR
        A --^ B
  </comment>
  <div class="mermaid">
  <img alt="mermaid chart" src="/SideEffectFile.svg">
</div>
</div>

#### Output6

```mermaid-image-inline
graph LR
  A --^ B
```

## Motivating Example: Paywall Excepts

Say Your blog site required some arbitrary requirement that you had to split your file into separate chunks for the preview, teaser, and paywall sections of an article.

Using the article splitter - you could keep your prose in tact as a complete work (a much more tenable editorial process) but then post-process your file so that your work was appropriately split up into chunks to meet some file system layout requirement.

You might use the common tag of `<!-- more -->` to separate the preview from the body. You could use the same tag again `<!-- more -->` or you might use something more semantic `<!-- teaserEnd -->` or `<!-- startPaywall -->`

So your prose might flow like this:

```text
Front Matter
Introduction
supporting statements
`<!-- more -->`
Controversial Claim1
supporting statements
supporting statements
Controversial Claim2
supporting statements
supporting statements
Opening Premise of Conclusion
`<!-- startPaywall -->`
Rich Media
Links for Offline Download
Supporting Claims Conclusion
Subordinated Conjectures of based on Conclusion
```

## Modeled/Supported Side Effects:

All of this goes into the vfile.data key. And then within that key, it is all stored under the prefix of `vfileEffects`. So the key prefix of `vfile.data.vfileEffects` the next level opens up for various side effect categories. Such as:

```
newFiles:[
    {...vfile.object},
],
httpRequests:[
    {method, url, payload},
    {method, url, payload}
],
```

## Roadmap Items

### httpEffects

1. Support AWS v4 URL signatures (in the header, or whereever) by allowing functions as a value to a key in the header

### fs Effect

1. Support new Effect Type - `fileDelete`?

### Effect Consumer Stream?

1. Supporting "Effects as Inputs", perhaps the Effect Consumer can have an event emitter sending a stream of updates `started`, `completed`, etc. But then the time domain for plugins execution order gets pretty hairy/messy - or at least does not contibute to the principle of "plain & simple". This needs more planning... Help Welcomed.
