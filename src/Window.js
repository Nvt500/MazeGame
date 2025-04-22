class Window 
{
    #canvas;
    #gl;
    #keys;
    #keys_pressed;

    constructor(canvas_id)
    {
        this.#canvas = document.getElementById(canvas_id);

        if (this.#canvas == null || !this.#canvas.getContext)
        {
            alert("Unable to access canvas.", );
            return;
        }
        
        this.#gl = this.#canvas.getContext("webgl");

        if (this.#gl === null) 
        {
            alert(
                "Unable to initialize WebGL. Your browser or machine may not support it.",
            );
            return;
        }

        this.#gl.enable(this.#gl.DEPTH_TEST);
        this.#gl.depthFunc(this.#gl.LEQUAL); 

        this.#canvas.addEventListener("click", async () => {
            if (document.pointerLockElement == this.#canvas)
            {
                document.exitPointerLock();
                this.#keys.clear();
            }
            else 
            {
                try
                {
                    await this.#canvas.requestPointerLock({
                        unadjustedMovement: true,
                    });
                }
                catch (SecurityError)
                {
                    document.exitPointerLock();
                    this.#keys.clear();
                }
            }
        });

        this.#keys = new Map();
        this.#keys_pressed = [];
        
        window.addEventListener("keydown", (event) => {
            if (document.pointerLockElement == this.#canvas)
            {
                this.#keys.set(event.key, true);
            }
        });

        window.addEventListener("keyup", (event) => {
            if (document.pointerLockElement == this.#canvas)
            {
                this.#keys.set(event.key, false);
            }
        });

        window.addEventListener("keypress", (event) => {
            if (document.pointerLockElement == this.#canvas)
            {
                this.#keys_pressed.push(event.key);
            }
        });
    }

    removePointerLock()
    {
        document.exitPointerLock();
        this.#keys.clear();
    }

    get gl()
    {
        return this.#gl;
    }

    get canvas()
    {
        return this.#canvas;
    }

    clear()
    {
        this.#gl.clearColor(0.0, 0.0, 0.2, 1.0); 
        this.#gl.clearDepth(1.0);

        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);
        
        this.#keys_pressed = [];
    }

    on_mouse_move(func)
    {
        this.#canvas.addEventListener("mousemove", (event) => {
            if (document.pointerLockElement === this.#canvas)
            {
                func({
                    x: event.movementX,
                    y: event.movementY,
                });
            }
        });
    }

    on_key_down(key, func)
    {
        if (this.#keys.get(key.toLowerCase()))
            func();
    }

    match_keys_down(func)
    {
        this.#keys.entries().filter((pair) => {
            return pair[1];
        }).forEach((pair) => {
            func(pair[0]);
        });
    }

    on_key_press(key, func)
    {
        if (this.#keys_pressed.includes(key.toLowerCase()))
            func();
    }

    draw(gl_type, ...layers)
    {
        let offset = 0;
        for (let layer of layers.flat())
        {
            offset = layer.draw(offset, gl_type);
        }
    }

    make_shader_program(...sources)
    {
        let shaders = [];
        let attributes = [];
        for (const source of sources.flat())
        {
            attributes = attributes.concat(this.#get_attribute_names(source.source));
            shaders.push(Shader.create(this.#gl, source.source, source.type));
        }

        const shaderProgram = new ShaderProgram(this.#gl);
        shaderProgram.attachShaders(shaders);
        shaderProgram.make();

        let shader_obj = {
            shaderProgram: shaderProgram,
        };
        for (const attr of attributes)
        {
            switch (attr.type)
            {
                case "attribute":
                    shader_obj[attr.name + attr.type[0].toUpperCase() + attr.type.slice(1)] = {
                        attr: attr,
                        value: undefined,
                        location: this.#gl.getAttribLocation(shaderProgram.program, attr.name),
                    };
                    break;
                case "uniform":
                    shader_obj[attr.name + attr.type[0].toUpperCase() + attr.type.slice(1)] = {
                        attr: attr,
                        value: undefined,
                        location: this.#gl.getUniformLocation(shaderProgram.program, attr.name),
                    };
                    break;
                default:
                    break;
            }
        }

        return shader_obj;
    }

    #get_attribute_names(source)
    {
        // ONLY WORKS IF WRITES
        // (attribute|uniform) type name;
        let attributes = [];
        const expression = /(?<type>attribute|uniform)[ ]+(?<data_type>[a-zA-Z0-9]+)[ ]+(?<name>[a-zA-Z0-9]+)[ ]*;/g;
        const regex = source.matchAll(expression);
        for (const result of regex)
        {
            const name = result.groups.name;
            const type = result.groups.type;
            const data_type = result.groups.data_type;
            attributes.push({name: name, type: type, data_type: data_type});
        }

        return attributes;
    }

    load_attributes_and_uniforms(shader_obj)
    {
        for (const key in shader_obj)
        {
            if (key == "shaderProgram") continue;

            switch (shader_obj[key].attr.type)
            {
                case "attribute":
                    const alocation = shader_obj[key].location;

                    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, shader_obj[key].value);
                    this.#gl.vertexAttribPointer(
                        alocation,
                        3, // HEY MAN DID YOU KNOW TEXTURES DONT USE 3 COORDINATES
                        // OH REALLLY???? I DIDNT KNOWWWW!!!!!!!
                        this.#gl.FLOAT,
                        false,
                        0,
                        0,
                    );

                    this.#gl.enableVertexAttribArray(alocation);
                    break;
                case "uniform":
                    const ulocation = shader_obj[key].location;
                    
                    switch(shader_obj[key].attr.data_type)
                    {
                        case "mat4":
                            this.#gl.uniformMatrix4fv(
                                ulocation,
                                false,
                                shader_obj[key].value,
                            );
                            break;
                        case "sampler2D":
                        case "bool":
                            this.#gl.uniform1i(
                                ulocation,
                                shader_obj[key].value,
                            );
                            break;
                        default:
                            console.log(shader_obj);
                            throw "Unknown data_type: " + shader_obj[key].attr.data_type;
                    }
                    

                    shader_obj[key].location = ulocation;
                    break;
                default:
                    break;
            }
        }
    }

    update_uniform_mat4(location, value)
    {
        this.#gl.uniformMatrix4fv(
            location,
            false,
            value,
        );
    }
}