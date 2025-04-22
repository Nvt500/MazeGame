window.addEventListener("load", main);

function onShowMap()
{
    const map = document.querySelector("#map");
    if (map.style.display == "inline-block")
    {
        map.style.display = "none";
    }
    else 
    {
        map.style.display = "inline-block";
    }
}

function restart()
{
    let u = location.href.split("?")[0];
    const params = new URLSearchParams();
    params.append("mapwidth", document.querySelector("#mapwidth").value);
    params.append("mapheight", document.querySelector("#mapheight").value);
    params.append("minpathlength", document.querySelector("#minpathlength").value);
    params.append("maxpathlength", document.querySelector("#maxpathlength").value);
    params.append("numinnerbranch", document.querySelector("#numinnerbranch").value); 
    params.append("mininnerbranch", document.querySelector("#mininnerbranch").value);
    params.append("maxinnerbranch", document.querySelector("#maxinnerbranch").value);
    params.append("numouterbranch", document.querySelector("#numouterbranch").value); 
    params.append("minouterbranch", document.querySelector("#minouterbranch").value); 
    params.append("maxouterbranch", document.querySelector("#maxouterbranch").value);
    location.replace(u + "?" + params.toString());
}

function defaults()
{
    location.replace(location.href.split("?")[0]);
}

function main(now_offset)
{   
    // Offset now for play again.
    if (now_offset instanceof Event) now_offset = 0;
    else now_offset *= 0.001;

    const url = location.search;
    const urlParams = new URLSearchParams(url);

    let maze_attrs;
    if (urlParams.size != 10)
        maze_attrs = make_maze(
            15, 15,
            20, 50,
            5, 0, 10,
            5, 0, 5,
        );
    else
    {
        maze_attrs = make_maze(
            parseInt(urlParams.get("mapwidth")), parseInt(urlParams.get("mapheight")),
            parseInt(urlParams.get("minpathlength")), parseInt(urlParams.get("maxpathlength")),
            parseInt(urlParams.get("numinnerbranch")), parseInt(urlParams.get("mininnerbranch")), parseInt(urlParams.get("maxinnerbranch")),
            parseInt(urlParams.get("numouterbranch")), parseInt(urlParams.get("minouterbranch")), parseInt(urlParams.get("maxouterbranch")),
        );
        
        document.querySelector("#mapwidth").value = parseInt(urlParams.get("mapwidth")); 
        document.querySelector("#mapheight").value = parseInt(urlParams.get("mapheight"));
        document.querySelector("#minpathlength").value = parseInt(urlParams.get("minpathlength")); 
        document.querySelector("#maxpathlength").value = parseInt(urlParams.get("maxpathlength"));
        document.querySelector("#numinnerbranch").value = parseInt(urlParams.get("numinnerbranch")); 
        document.querySelector("#mininnerbranch").value = parseInt(urlParams.get("mininnerbranch")); 
        document.querySelector("#maxinnerbranch").value = parseInt(urlParams.get("maxinnerbranch"));
        document.querySelector("#numouterbranch").value = parseInt(urlParams.get("numouterbranch"));
        document.querySelector("#minouterbranch").value = parseInt(urlParams.get("minouterbranch")); 
        document.querySelector("#maxouterbranch").value = parseInt(urlParams.get("maxouterbranch"));
    }
    
    // Window
    const window = new Window("glcanvas");

    const gl = window.gl;

    // Shaders
    const shader_obj = init_shaders(window);

    // Buffers
    let buffers = init_buffers(gl, maze_attrs);

    window.clear();

    // Player
    let player = new Player(-0.4, -0.4, 0.0, 0.8, 0.8, 1.6); // -0.4, -0.4, 0.0, 0.8, 0.8, 1.6

    // Position Player
    let positionTrans = mat4.create();
    mat4.translate(positionTrans, positionTrans, vec3.fromValues(-maze_attrs.start.x*2+1.0, maze_attrs.start.y*2+1.0, 0.0));

    // Eye & Center
    let eye = vec3.fromValues(0.0, 0.0, 1.4); //0.0, 0.0, 6.0
    const OGCENTER = vec3.fromValues(4.0, 4.0, 1.4);
    let center = vec3.clone(OGCENTER); //4.0, 4.0, 6.0

    // View
    const view = mat4.create();
    mat4.lookAt(
        view,
        eye,
        center,
        vec3.fromValues(0.0, 0.0, 1.0),
    );

    const fieldOfView = glMatrix.toRadian(45.0);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    // Projection
    const projection = mat4.create();
    mat4.perspective(projection, fieldOfView, aspect, zNear, zFar);

    // Model
    const model = mat4.create();

    // Load stuff
    shader_obj.positionAttribute.value = buffers.positionBuffer;
    shader_obj.inColorAttribute.value = buffers.colorBuffer;
    shader_obj.modelUniform.value = model;
    shader_obj.viewUniform.value = view;
    shader_obj.projectionUniform.value = projection;

    shader_obj.inTextureCordAttribute.value = buffers.textureBuffer;
    shader_obj.textureUniform.value = 0;
    shader_obj.useTexturesUniform.value = true;

    window.load_attributes_and_uniforms(shader_obj);

    // Layers
    const end_cube_layer = new RotationLayer(gl, 
        shader_obj.textureUniform.location,
        shader_obj.useTexturesUniform.location,
        1, shader_obj.modelUniform.location, buffers.end_cube);
    const wall_layer = new Layer(gl, 
        shader_obj.textureUniform.location,
        shader_obj.useTexturesUniform.location,
        buffers.cubes);
    const wall_layer_rotation = new RotationLayer(gl, 
        shader_obj.textureUniform.location,
        shader_obj.useTexturesUniform.location, 
        1, shader_obj.modelUniform.location, buffers.cubes);

    // Create Direction vecs
    let FORWARD = vec3.fromValues(0.1, 0.1, 0.0);
    let BACKWARD = vec3.fromValues(-0.1, -0.1, 0.0);
    let LEFT = vec3.fromValues(-0.1, 0.1, 0.0);
    let RIGHT = vec3.fromValues(-0.1, 0.1, 0.0);

    let xAngle = 0;
    let yAngle = 0;
    window.on_mouse_move((offset) => {
        // Add to angle
        xAngle -= offset.x;
        yAngle += offset.y;

        const multiplier = 10;

        // Clamp angles
        if (yAngle > 90*multiplier)
            yAngle = 90*multiplier;
        if (yAngle < -40*multiplier)
            yAngle = -40*multiplier;

        // Create rotation matrix from angle
        let xTrans = mat4.create();
        mat4.fromRotation(xTrans, glMatrix.toRadian(xAngle) / multiplier, vec3.fromValues(0.0, 0.0, 1.0));
        let yTrans = mat4.create();
        mat4.fromRotation(yTrans, glMatrix.toRadian(yAngle) / multiplier, vec3.fromValues(-1.0, 1.0, 0.0));

        // Rotate center
        center = vec3.clone(OGCENTER);
        vec3.transformMat4(center, center, yTrans);
        vec3.transformMat4(center, center, xTrans);

        // Rotate direction to move
        FORWARD = vec3.fromValues(0.1, 0.1, 0.0);
        vec3.transformMat4(FORWARD, FORWARD, xTrans);
        BACKWARD = vec3.fromValues(-0.1, -0.1, 0.0);
        vec3.transformMat4(BACKWARD, BACKWARD, xTrans);
        LEFT = vec3.fromValues(-0.1, 0.1, 0.0);
        vec3.transformMat4(LEFT, LEFT, xTrans);
        RIGHT = vec3.fromValues(0.1, -0.1, 0.0);
        vec3.transformMat4(RIGHT, RIGHT, xTrans);
    });

    // Time
    let then = 0;
    let deltaTime = 0;
    let total = 0;
    // Elements
    const time_element = document.querySelector("#time");
    const fps_element = document.querySelector("#fps");
    const can_fly = document.querySelector("#canfly");
    const play_again = document.querySelector("#playagain");
    // Flags
    let is_wireframe = false;
    const get_wireframe = () => is_wireframe? gl.LINES : gl.TRIANGLES;
    let is_rotate = false;
    function render(now)
    {
        // Calculate time
        now *= 0.001;
        now -= now_offset;
        deltaTime = now - then;
        total += deltaTime;
        then = now;
        // Show time and fps
        time_element.textContent = total.toFixed(2);
        fps_element.textContent = (1 / deltaTime).toFixed(2);

        // Key Handler
        let velocity = vec3.create();
        window.match_keys_down((key) => {
            switch (key.toLowerCase())
            {
                case "backspace":
                case "control":
		case " ":
                    vec3.add(velocity, velocity, vec3.fromValues(0.0, 0.0, 0.1));
                    break;
                case "shift":
                    vec3.add(velocity, velocity, vec3.fromValues(0.0, 0.0, -0.1));
                    break;
                case "w":
                    vec3.add(velocity, velocity, FORWARD);
                    break;
                case "s":
                    vec3.add(velocity, velocity, BACKWARD);
                    break;
                case "a":
                    vec3.add(velocity, velocity, LEFT);
                    break;
                case "d":
                    vec3.add(velocity, velocity, RIGHT);
                    break;
                default:
                    break;
            }
        });
        window.on_key_press("v", () => is_wireframe = !is_wireframe);
        window.on_key_press("r", () => is_rotate = !is_rotate);

        // Clear Screen
        window.clear();

        // GRAVIRY
        if (!can_fly.checked)
            vec3.add(velocity, velocity, vec3.fromValues(0.0, 0.0, -0.1));

        // Scale velocity
        vec3.multiply(velocity, velocity, vec3.fromValues(0.6, 0.6, 0.6));
        
        // Win condition
        if (player.collides_with(velocity, positionTrans, buffers.end_cube))
        {
            play_again.style.display = "block";
            console.log(`You won in ${total.toFixed(2)} seconds.`);
            return;
        }

        // Collision
        velocity = player.collision(velocity, positionTrans, buffers.cubes);

        // Move Player
        mat4.translate(positionTrans, positionTrans, velocity);

        // Move Eye & Center
        let newEye = vec3.create();
        let newCenter = vec3.create();
        vec3.transformMat4(newEye, eye, positionTrans);
        vec3.transformMat4(newCenter, center, positionTrans);

        // Create view and set it to uniform
        const view = mat4.create();
        mat4.lookAt(
            view,
            newEye,
            newCenter,
            vec3.fromValues(0.0, 0.0, 1.0),
        );
        window.update_uniform_mat4(shader_obj.viewUniform.location, view);
        
        // Draw in order of data buffered.
        if (is_rotate)
            window.draw(get_wireframe(), end_cube_layer, wall_layer_rotation);
        else
            window.draw(get_wireframe(), end_cube_layer, wall_layer);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}


function init_shaders(window)
{
    const vertexSource = `
        attribute vec4 position;
        uniform mat4 model;
        uniform mat4 view;
        uniform mat4 projection;

        attribute vec4 inColor;
        varying lowp vec4 outColor;
        
        attribute vec4 inTextureCord;
        varying lowp vec2 outTextureCord;
        
        void main()
        {
            gl_Position = projection * view * model * position;

            outColor = inColor;
            outTextureCord = inTextureCord.xy;
        }
    `;

    const fragmentSource = `
        varying lowp vec4 outColor;

        varying lowp vec2 outTextureCord;

        uniform sampler2D texture;

        uniform bool useTextures;

        void main() 
        {
            if (useTextures)
                gl_FragColor = texture2D(texture, outTextureCord);
            else 
                gl_FragColor = outColor;
        }
    `;

    const shader_obj = window.make_shader_program(
        {source: vertexSource, type: window.gl.VERTEX_SHADER},
        {source: fragmentSource, type: window.gl.FRAGMENT_SHADER}, 
    );

    return shader_obj;
}


function init_buffers(gl, maze_attrs)
{
    Texture.refresh_num_textures();
    
    //https://www.pixilart.com/art/brick-tile-sr22a5bca1ce8aws3
    const dungeon_floor_texture = Texture.create(gl, "https://art.pixilart.com/sr22a5bca1ce8aws3.png");

    //https://www.pixilart.com/art/skeleton-key-sr26f18728940aws3
    const key_texture = Texture.create(gl, 
        //"https://art.pixilart.com/sr25831653da4aws3.png"
        "https://art.pixilart.com/sr26f18728940aws3.png"
        //"https://art.pixilart.com/sr20722b5cecbaws3.png"
    );

    //https://www.pixilart.com/art/dungeon-wall-texture-9e8e240693123e6
    const dungeon_wall_texture = Texture.create(gl, "https://art.pixilart.com/9e8e240693123e6.png");
    
    const floor = new Cube((1-maze_attrs.cols)*2, 0, -1, maze_attrs.cols*2, maze_attrs.rows*2, 1, dungeon_floor_texture);
    
    const end = Cube.from_position(maze_attrs.end, key_texture);
    end.x += 0.5;
    end.length = 1.0;
    end.y += 0.5;
    end.width = 1.0;
    end.z += 0.5;
    end.height = 1.0;
    end.refresh_vertices();
    end.set_color("green");

    let cubes = [end, floor]; 

    for (const pos of maze_attrs.surrounding)
    {
        cubes.push(Cube.from_position(pos, dungeon_wall_texture));
    }
    
    let vertices = Cube.concat_vertices(cubes);

    const positionBuffer = Buffer.create(gl, vertices, Float32Array, gl.ARRAY_BUFFER);

    const indices = Cube.concat_indices(cubes);

    const indexBuffer = Buffer.create(gl, indices, Uint16Array, gl.ELEMENT_ARRAY_BUFFER);

    const colorBuffer = Buffer.create(gl, Cube.concat_colors(cubes), Float32Array, gl.ARRAY_BUFFER);

    const textureBuffer = Buffer.create(gl, Cube.concat_texture_cords(cubes), Float32Array, gl.ARRAY_BUFFER);
    
    return {
        num_vertices: indices.length,
        positionBuffer: positionBuffer,
        colorBuffer: colorBuffer,
        textureBuffer: textureBuffer,
        cubes: cubes.slice(1),
        end_cube: cubes[0],
    };
}