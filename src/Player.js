class Player 
{
    constructor(x, y, z, length, width, height) 
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.length = length;
        this.width = width;
        this.height = height;
    }

    collides_with(velocity, playerTrans, cube)
    {
        let newPosition = vec3.fromValues(this.x, this.y, this.z);
        vec3.transformMat4(newPosition, newPosition, playerTrans);
        vec3.add(newPosition, newPosition, velocity);

        if (
            newPosition[0] + this.length > cube.x && newPosition[0] < cube.x + cube.length &&
            newPosition[1] + this.width > cube.y && newPosition[1] < cube.y + cube.width &&
            newPosition[2] + this.height > cube.z && newPosition[2] < cube.z + cube.height
        )
        {
            return true;
        }

        return false;
    }

    collision(velocity, playerTrans, ...cubes)
    {
        let position = vec3.fromValues(this.x, this.y, this.z);
        vec3.transformMat4(position, position, playerTrans);

        for (let cube of cubes.flat())
        {
            for (let i = 0; i < 3; i++)
            {
                if (velocity[i] == 0)
                    continue;
    
                let newPosition = vec3.clone(position);
                newPosition[i] += velocity[i];

                if (
                    newPosition[0] + this.length > cube.x && newPosition[0] < cube.x + cube.length &&
                    newPosition[1] + this.width > cube.y && newPosition[1] < cube.y + cube.width &&
                    newPosition[2] + this.height > cube.z && newPosition[2] < cube.z + cube.height
                )
                {
                    velocity[i] = 0;
                }
            }
        }
        
        return velocity;
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