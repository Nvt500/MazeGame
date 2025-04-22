class Layer 
{
    #gl;
    #cubes;
    #textureSamplerLocation;
    #useTexturesLocation;

    constructor(gl, textureSamplerLocation, useTexturesLocation, ...cubes)
    {
        this.#gl = gl;
        this.#cubes = cubes.flat();
        this.#textureSamplerLocation = textureSamplerLocation;
        this.#useTexturesLocation = useTexturesLocation;
    }
    
    get gl()
    {
        return this.#gl;
    }

    get cubes()
    {
        return this.#cubes;
    }

    draw(offset, gl_type)
    {
        let num_vertices = offset;
        for (const cube of this.#cubes)
        {
            this.update_texture(cube.texture_id);
            this.#gl.drawElements(gl_type, 36, this.#gl.UNSIGNED_SHORT, 2 * num_vertices);
            num_vertices += 36;
        }
        return num_vertices;
    }

    update_texture(texture_id)
    {
        this.#gl.uniform1i(
            this.#useTexturesLocation,
            texture_id !== null
        );
        if (texture_id !== null)
            this.#gl.uniform1i(
                this.#textureSamplerLocation,
                texture_id
            );
    }
}