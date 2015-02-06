# comp2widget [![Titanium](http://www-static.appcelerator.com/badges/titanium-git-badge-sq.png)](http://www.appcelerator.com/titanium/) [![Alloy](http://www-static.appcelerator.com/badges/alloy-git-badge-sq.png)](http://www.appcelerator.com/alloy/)

A CLI tool for easily extending [titanium](http://appcelerator.com/titanium) components as a widget.

## Quickstart [![npm](http://img.shields.io/npm/v/comp2widget.png)](https://www.npmjs.org/package/comp2widget)

1. Install [comp2widget](http://npmjs.org/package/comp2widget) using [NPM](http://npmjs.org):

    ```
    npm install -g comp2widget
    ```

2. Create a widget if you didn't already have:

    ```
    alloy generate widget myWidget
    ```
    
4. Add the component you want to extend to the `index.xml` file and give it an id:

    ```xml
    <Alloy>
    	<Label id="myComponent"></Label>
    </Alloy>
    ```
    
5. Cd into the widget folder:

    ```
    cd app/widgets/myWidget/
    ```
    
6. Generate the helper file:

    ```
    comp2widget Titanium.UI.Label
    ```

5. Add following to the top of the `index.js` file:

    ```javascript
    var args = arguments[0] || {};
    require(WPATH('Titanium.UI.Label2widget')).extend(exports, args, $.myComponent);
    ```

6.  Now you can override and extend the component as you wish:

    ```javascript
    $.myComponent.text = 'Original text: ' + args.text || '';
    exports.setText = function (text)
    {
        $.myComponent.setText('Original text: ' + text);
    }
    ```
    
## Usage

Use `comp2widget` or `comp2widget -h` for full usage:

    Usage: comp2widget <component name ...> [options]
    
    Options:
    
      -h, --help           output usage information
      -V, --version        output the version number
      -s, --sdk <version>  SDK version to use
      -o, --out <name>     output name
      -n, --nocache        don't use cached api.json
