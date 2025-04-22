class Cube 
{
    #vertices;
    #colors;
    #texture_id;
    
    constructor(x, y, z, length, width, height, texture_id) 
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.length = length;
        this.width = width;
        this.height = height;

        this.refresh_vertices();
        this.set_color("white");
        this.repeat_colors();

        this.#texture_id = texture_id === undefined ? null : texture_id;
    }

    refresh_vertices()
    {
        let vertices = [
            
            // Bottom
            this.x+this.length, this.y+this.width, this.z,
            this.x, this.y+this.width, this.z,
            this.x+this.length, this.y, this.z,
            this.x, this.y, this.z,

            // Top
            this.x+this.length, this.y+this.width, this.z+this.height,
            this.x, this.y+this.width, this.z+this.height,
            this.x+this.length, this.y, this.z+this.height,
            this.x, this.y, this.z+this.height,
            
            // Front
            this.x+this.length, this.y, this.z+this.height,
            this.x, this.y, this.z+this.height,
            this.x+this.length, this.y, this.z,
            this.x, this.y, this.z,

            // Back
            this.x, this.y+this.width, this.z+this.height,
            this.x+this.length, this.y+this.width, this.z+this.height,
            this.x, this.y+this.width, this.z,
            this.x+this.length, this.y+this.width, this.z,

            // Left
            this.x, this.y, this.z+this.height,
            this.x, this.y+this.width, this.z+this.height,
            this.x, this.y, this.z,
            this.x, this.y+this.width, this.z,

            // Right
            this.x+this.length, this.y+this.width, this.z+this.height,
            this.x+this.length, this.y, this.z+this.height,
            this.x+this.length, this.y+this.width, this.z,
            this.x+this.length, this.y, this.z,
        ];

        this.#vertices = vertices;
    }

    get vertices()
    {
        return this.#vertices;
    }
    
    get colors()
    {
        return this.#colors;
    }

    get texture_id()
    {
        return this.#texture_id;
    }

    set_color(color)
    {
        switch(color)
        {
            case "red":
                this.#colors = [
                    1.0, 0.0, 0.0,
                    1.0, 0.0, 0.0,
                    1.0, 0.0, 0.0,
                    1.0, 0.0, 0.0,
                ];
                break;
            case "green":
                this.#colors = [
                    0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0,
                ];
                break;
            case "blue":
                this.#colors = [
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                    0.0, 0.0, 1.0,
                ];
                break;    
            case "white":
                this.#colors = [
                    1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0,
                ];
                break;
            case "rainbow":
                this.#colors = [
                    1.0, 0.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 0.0, 1.0,
                    1.0, 1.0, 1.0,
                ]
                break;
            default:
                throw(`Invalid color name: ${color}.`);
        }
        this.repeat_colors();
    }

    repeat_colors()
    {
        for (let i = 0; i < 5; i++)
        {
            for (let e = 0; e < 12; e++)
                this.#colors.push(this.#colors[e]);
        }
    }

    static from_position(pos, texture_id)
    {
        return new Cube(-pos.x*2, pos.y*2, 0, 2, 2, 2, texture_id);
    }

    static concat_vertices(...cubes)
    {
        return [].concat(cubes.flat().flatMap((item) => item.vertices));
    }

    static concat_colors(...cubes)
    {
        return [].concat(cubes.flat().flatMap((item) => item.colors));
    }

    static concat_indices(...cubes)
    {
        const create_indices = (i) => 
        {
            return [ 
                /* wireframe?
                0+24*i,
                1+24*i,
                0+24*i,
                2+24*i,
                1+24*i,
                3+24*i,
                2+24*i,
                3+24*i,

                4+24*i,
                5+24*i,
                4+24*i,
                6+24*i,
                5+24*i,
                7+24*i,
                6+24*i,
                7+24*i,

                8+24*i,
                9+24*i,
                8+24*i,
                10+24*i,
                9+24*i,
                11+24*i,
                10+24*i,
                11+24*i,

                12+24*i,
                13+24*i,
                12+24*i,
                14+24*i,
                13+24*i,
                15+24*i,
                14+24*i,
                15+24*i,

                16+24*i,
                17+24*i,
                16+24*i,
                18+24*i,
                17+24*i,
                19+24*i,
                18+24*i,
                19+24*i,

                20+24*i,
                21+24*i,
                20+24*i,
                22+24*i,
                21+24*i,
                23+24*i,
                22+24*i,
                23+24*i,
                */
                0+24*i,
                1+24*i,
                3+24*i,
                3+24*i,
                2+24*i,
                0+24*i,
                4+24*i,
                5+24*i,
                7+24*i,
                7+24*i,
                6+24*i,
                4+24*i,
                8+24*i,
                9+24*i,
                11+24*i,
                11+24*i,
                10+24*i,
                8+24*i,
                12+24*i,
                13+24*i,
                15+24*i,
                15+24*i,
                14+24*i,
                12+24*i,
                16+24*i,
                17+24*i,
                19+24*i,
                19+24*i,
                18+24*i,
                16+24*i,
                20+24*i,
                21+24*i,
                23+24*i,
                23+24*i,
                22+24*i,
                20+24*i,
            ];
        };
        return [].concat(cubes.flat().flatMap((_, index) => create_indices(index)));
    }

    static concat_texture_cords(...cubes)
    {
        const create_texture_cords = () =>
        {
            return [
                1, 1, 0,
                0, 1, 0,
                1, 0, 0,
                0, 0, 0,

                1, 1, 0,
                0, 1, 0,
                1, 0, 0,
                0, 0, 0,

                1, 1, 0,
                0, 1, 0,
                1, 0, 0,
                0, 0, 0,

                1, 1, 0,
                0, 1, 0,
                1, 0, 0,
                0, 0, 0,

                1, 1, 0,
                0, 1, 0,
                1, 0, 0,
                0, 0, 0,

                1, 1, 0,
                0, 1, 0,
                1, 0, 0,
                0, 0, 0,
            ];
        }
        return [].concat(cubes.flat().flatMap(() => create_texture_cords()));
    }

    get centerX()
    {
        return this.x - this.length/2;
    }
    get centerY()
    {
        return this.y - this.width/2;
    }
    get centerZ()
    {
        return this.z - this.height/2;
    }
}
