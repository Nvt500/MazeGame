class Texture 
{
    static #num_textures = 0;

    static refresh_num_textures()
    {
        this.#num_textures = 0;
    }

    static create(gl, url)
    {
        const texture = gl.createTexture();
        const texture_id = gl.TEXTURE0 + this.#num_textures;
        gl.activeTexture(texture_id);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            1,
            1,
            0,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255]),
        );

        const image = new Image();
        image.onload = () => {
            gl.activeTexture(texture_id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                image,
            );
            let isPowerOf2 = (value) => (value & (value - 1)) === 0;
            if (isPowerOf2(image.width) && isPowerOf2(image.height)) 
            {
                gl.generateMipmap(gl.TEXTURE_2D);
            } 
            else
            {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        }
        image.crossOrigin = "";
        image.src = url;

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        this.#num_textures++;

        return this.#num_textures-1;
    }
}