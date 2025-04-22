class Buffer 
{
    static create(gl, array, type, gl_type)
    {
        const buffer = gl.createBuffer();

        gl.bindBuffer(gl_type, buffer);

        gl.bufferData(gl_type, new type(array), gl.STATIC_DRAW);

        return buffer;
    }
}