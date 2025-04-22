class RotationLayer extends Layer
{
    #rotation;
    #rotation_by;
    #model_uniform;

    constructor(gl, textureSamplerLocation, useTexturesLocation, rotation, modelUniform, ...cubes)
    {
        super(gl, textureSamplerLocation, useTexturesLocation, cubes.flat());

        this.#rotation = 0;
        this.#rotation_by = glMatrix.toRadian(rotation);
        this.#model_uniform = modelUniform;
    }

    draw(offset, gl_type)
    {
        this.#rotation += this.#rotation_by;
        let num_vertices = offset;
        for (const cube of super.cubes)
        {
            super.update_texture(cube.texture_id);

            let new_model = mat4.create();
                
            mat4.translate(new_model, new_model, vec3.fromValues(
                cube.x+cube.length/2,
                cube.y+cube.width/2,
                -cube.z+cube.height/2,
            ));
            mat4.rotateZ(new_model, new_model, this.#rotation);
            mat4.translate(new_model, new_model, vec3.fromValues(
                -cube.x-cube.length/2,
                -cube.y-cube.width/2,
                cube.z-cube.height/2
            ));

            super.gl.uniformMatrix4fv(
                this.#model_uniform,
                false,
                new_model
            );

            super.gl.drawElements(gl_type, 36, super.gl.UNSIGNED_SHORT, 2 * num_vertices);
            num_vertices += 36;
        }

        super.gl.uniformMatrix4fv(
            this.#model_uniform,
            false,
            mat4.create(),
        );

        return num_vertices;
    }
}