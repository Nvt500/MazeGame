class ShaderProgram
{
    #gl;
    #program;
    constructor(gl)
    {
        this.#gl = gl;
        this.#program = this.#gl.createProgram();
    }

    get program()
    {
        return this.#program;
    }

    attachShader(shader)
    {
        if (shader != null)
            this.#gl.attachShader(this.#program, shader);
    }

    attachShaders(...shaders)
    {
        for (let shader of shaders.flat())
            this.attachShader(shader);
    }

    make()
    {
        this.#gl.linkProgram(this.#program);

        if (!this.#gl.getProgramParameter(this.#program, this.#gl.LINK_STATUS)) 
        {
            alert(
                `Unable to initialize the shader program: ${this.#gl.getProgramInfoLog(
                    this.#program,
                )}`,
            );
            return;
        }

        this.#gl.useProgram(this.#program);
    }

    
}