## JSON2SM
write json/yaml , generate fake-server and api documents.

## Install
* clone this project
* run `npm install`
* run `npm link`

## Usage
* `json2sm -h` : get help
* `json2sm -s` : start the fake-server, optional --port , default to 8877
* `json2sm -o` : generate document (markdown), default to ./build/

## Example
### Simplest
if you have this:
```yaml
route : get,/api/user/info #http://localhost:8877/api/user/info
doc: # if you don't want the document, remove 'doc'
    type: markdown
    path: userInfo/user.md
    title: CustomerInfo
params:
    userId:
        necessary: true # optional ,default to false
        desc : device uuid #optional
result:
    type: object
    properties:
        code: 200
        data:
            type: object
            properties:
                realName:
                    desc: user name
                    faker: name.findName
                sex:
                    desc: '性别 0保密 1男 2女'
                    type: integer
                    pattern: !!js/regexp /[0-2]/
                isVip:
                    type: integer
                    pattern: "(1|0)"
                files:
                    desc: user files
                    type: array
                    minItems: 0
                    maxItems: 3
                    items:
                        type: object
                        properties:
                            name:
                                desc: file name
                                faker: lorem.word
                            url:
                                faker: image.imageUrl
```
you will get this:
![pic](http://ss-storage.oss-cn-beijing.aliyuncs.com/github/github-json2sm-1.png)
and this:
![pic](http://ss-storage.oss-cn-beijing.aliyuncs.com/github/5B65FA02-8279-4029-ADA2-5D5850858C29.png)

for `faker` value, check [here](https://github.com/Marak/Faker.js#api-methods)
for `pattern` value, check [here](https://github.com/fent/randexp.js)

### other example
`array`,`object`,`$include` example, please check [test](https://github.com/imshenshen/json2SM/tree/master/test)

`extends`,`block` like [jade](http://jade-lang.com/), *coming soon*

you can cd to the test dir, run `json2sm -s -o`, try it!

### Coming Soon
* `$extends`,`$block`
* `json2sm --watch`
* ...
