/*
TODO:
-- Bug where there is no surrounding walls when E isn't surrounded already

    ! ! ! ! ! ! !               
  ! @ @ @ @ @ @ S !             
  ! @ ! ! ! ! ! !               
! @ @ ! ! @ @ @ !               
! @ ! @ @ @ ! @ !   ! ! !       
! @ ! @ ! ! @ @ ! ! @ @ @ !     
! @ @ @ ! ! @ ! @ @ @ ! @ @ !   
  ! ! @ @ ! @ @ ! ! @ ! ! @ !   
      ! @ @ ! @ @ @ @ ! E @ !   
        ! !   ! ! ! !     !     
*/

class Maze 
{
    #empty_char;
    #filled_char;
    constructor(cols, rows, empty_char, filled_char)
    {
        this.#empty_char = empty_char;
        this.#filled_char = filled_char;
        this.cols = cols;
        this.rows = rows;
        this.table = this.#make_table();
    }

    #make_table()
    {
        let table = [];
        for (let i = 0; i < this.rows; i++)
        {
            table[i] = [];
            for (let e = 0; e < this.cols; e++)
                table[i][e] = this.#empty_char;
        }
        return table;
    }

    #unfill(pos_arr)
    {
        for (const pos of pos_arr)
        {
            this.clear_val(pos);
        }
    }

    #reverse_pos(num, pos)
    {
        switch (num)
        {
            case 0:
                pos.move_left();
                break;
            case 1:
                pos.move_right();
                break;
            case 2:
                pos.move_down();
                break;
            case 3:
                pos.move_up();
                break;
            default:
                alert("Wtf is happening in reverse_pos.");
        }
    }

    get middle()
    {
        return new Position(Math.floor(this.cols / 2), Math.floor(this.rows / 2));
    }

    clear_val(pos)
    {
        try
        {
            this.table[pos.y][pos.x] = this.#empty_char;
        }
        catch
        {

        }
    }

    set_val_to(pos, val)
    {
        try
        {
            this.table[pos.y][pos.x] = val;
        }
        catch
        {

        }
    }

    set_val(pos)
    {
        try
        {
            this.table[pos.y][pos.x] = this.#filled_char;
        }
        catch
        {

        }
    }

    get_val(pos)
    {
        try 
        {
            return this.table[pos.y][pos.x];
        }
        catch
        {
            return null;
        }
    }

    generate_path(starting_pos, min_length, max_length)
    {
        this.set_val(starting_pos);
        let pos = starting_pos.clone();
        let i = 0;
        let tried = new Set([]);
        let path = [pos.clone()];
        while (true)
        {
            if (tried.size == 4)
            {
                if (i < min_length)
                {
                    // UPDATE SO IT DOESN'T COMPLETLEY RESET TABLE AND ONLY PATH GENERATED.
                    this.#unfill(path);
                    this.set_val(starting_pos);
                    pos = starting_pos.clone();
                    path = [pos.clone()];
                    i = 0;
                    tried.clear();
                    continue;
                }
                break;
            }

            let num;
            switch (num = Math.floor(Math.random() * 4))
            {
                case 0:
                    pos.move_right();
                    break;
                case 1:
                    pos.move_left();
                    break;
                case 2:
                    pos.move_up();
                    break;
                case 3:
                    pos.move_down();
                    break;
                default:
                    alert("Random num didn't give 0-3 but gave: " + num);
            }
    
            if (pos.y >= this.rows || pos.y < 0 ||
                pos.x >= this.cols || pos.x < 0
            )
            {
                tried.add(num);
                this.#reverse_pos(num, pos);
                continue;
            }
            if (this.get_val(pos) == this.#filled_char)
            {
                tried.add(num);
                this.#reverse_pos(num, pos);
                continue;
            }
    
            switch (num)
            {
                case 0:
                    if (
                        this.get_val(pos.RIGHT) == this.#filled_char ||
                        this.get_val(pos.UP) == this.#filled_char ||
                        this.get_val(pos.DOWN) == this.#filled_char
                    )
                    {
                        tried.add(num);
                        this.#reverse_pos(num, pos);
                        continue;
                    }
                    break;
                case 1:
                    if (
                        this.get_val(pos.LEFT) == this.#filled_char ||
                        this.get_val(pos.UP) == this.#filled_char ||
                        this.get_val(pos.DOWN) == this.#filled_char
                    )
                    {
                        tried.add(num);
                        this.#reverse_pos(num, pos);
                        continue;
                    }
                    break;
                case 2:
                    if (
                        this.get_val(pos.RIGHT) == this.#filled_char ||
                        this.get_val(pos.LEFT) == this.#filled_char ||
                        this.get_val(pos.UP) == this.#filled_char
                    )
                    {
                        tried.add(num);
                        this.#reverse_pos(num, pos);
                        continue;
                    }
                    break;
                case 3:
                    if (
                        this.get_val(pos.RIGHT) == this.#filled_char ||
                        this.get_val(pos.LEFT) == this.#filled_char ||
                        this.get_val(pos.DOWN) == this.#filled_char
                    )
                    {
                        tried.add(num);
                        this.#reverse_pos(num, pos);
                        continue;
                    }
                    break;
                default:
                    alert("Wtf is going on in checking around in switch statement.");
            }
    
            this.set_val(pos);
            i++;
            tried.clear();
            path.push(pos.clone());

            if (i >= max_length)
            {
                break;
            }
        }

        return path;
    }

    toString()
    {
        const rowToString = (row) => {
            let str = "";
            for (const item of row)
                str += item + " ";
            return str;
        };

        const surrounding = this.get_surrounding();
        let string = "";

        string += "  ";
        for (let i = 0; i < this.table[0].length; i++)
        {
            if (surrounding.find((pos) => pos.x == i && pos.y < 0))
                string += "! ";
            else 
                string += "  ";
        }
        string += "\n";

        for (let i = 0; i < this.table.length; i++)
            if (surrounding.find((pos) => {
                return pos.x < 0 && pos.y == i;
            }))
                string += "! " + rowToString(this.table[i]) + "\n";
            else 
                string += "  " + rowToString(this.table[i]) + "\n";
        
        string += "  ";
        for (let i = 0; i < this.table[0].length; i++)
        {
            if (surrounding.find((pos) => pos.x == i && pos.y >= this.table.length))
                string += "! ";
            else 
                string += "  ";
        }
        return string;
    }

    get_surrounding()
    {
        let pos_arr = [];
        for (let y = 0; y < this.table.length; y++)
        {
            for (let x = 0; x < this.table[y].length; x++)
            {
                const pos = new Position(x, y);
                if (this.get_val(pos) == this.#filled_char)
                {
                    if (pos.RIGHT.x >= this.cols)
                        pos_arr.push(pos.RIGHT);
                    if (pos.LEFT.x < 0)
                        pos_arr.push(pos.LEFT);
                    if (pos.UP.y < 0)
                        pos_arr.push(pos.UP);
                    if (pos.DOWN.y >= this.rows)
                        pos_arr.push(pos.DOWN);
                    
                    continue;
                }

                if (
                    this.get_val(pos.RIGHT) == this.#filled_char ||
                    this.get_val(pos.LEFT) == this.#filled_char ||
                    this.get_val(pos.UP) == this.#filled_char ||
                    this.get_val(pos.DOWN) == this.#filled_char
                )
                {
                    pos_arr.push(pos);
                }
            }
        }
        return pos_arr;
    }
}


class Position 
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    move_right()
    {
        this.x += 1;
    }

    move_left()
    {
        this.x -= 1;
    }

    move_up()
    {
        this.y -= 1;
    }

    move_down()
    {
        this.y += 1;
    }

    get RIGHT()
    {
        return new Position(this.x + 1, this.y);
    }

    get LEFT()
    {
        return new Position(this.x - 1, this.y);
    }

    // UP AND DOWN ARE REVERSED FOR TABLE (2D-ARRAY).

    get UP()
    {
        return new Position(this.x, this.y - 1);
    }

    get DOWN()
    {
        return new Position(this.x, this.y + 1);
    }

    clone()
    {
        return new Position(this.x, this.y);
    }
}

function add_maze_to_html(string)
{
    const show_map = document.querySelector("#showmap");
    
    let empty_string = "";
    for (const char of string)
    {
        if (char == "\n")
            empty_string += char;
        else 
            empty_string += " ";
    }
    let pre = document.querySelector("#map");
    pre.textContent = empty_string;
    pre.className = string;
    show_map.onclick = () => {
        const map = document.querySelector("#map");
        const className = pre.className;
        map.className = map.textContent;
        map.textContent = className;
    };
}

// default 
// 15, 15,
// 20, 50, 
// 5, 0, 10,
// 5, 0, 5, 
function make_maze(
    cols, rows, 
    min_path_length, max_path_length,
    num_inner_branch, min_inner_branch_length, max_inner_branch_length,
    num_outer_branch, min_outer_branch_length, max_outer_branch_length,
)
{
    // BIG MAZE   rows=41; cols=81; 200-500; 50&20; 0-50, 0-10;
    // SMALL MAZE rows=15; cols=15; 20-50  ; 5&5; 0-10, 0-5 ;
    const map = new Maze(cols, rows, " ", "@");
    let pos = map.middle;

    const path = map.generate_path(pos, min_path_length, max_path_length);

    for (let i = 0; i < num_inner_branch; i++)
    {
        const index = Math.floor(Math.random() * (path.length - 1));
        const p = map.generate_path(path[index], min_inner_branch_length, max_inner_branch_length);
        for (let e = 0; e < num_outer_branch; e++)
        {
            const index2 = Math.floor(Math.random() * (p.length - 1));
            map.generate_path(p[index2], min_outer_branch_length, max_outer_branch_length);
        }
    }

    const pos_arr = map.get_surrounding();
    for (let pos of pos_arr)
    {
        map.set_val_to(pos, "!");
    }
    map.set_val_to(path[0], "S");
    map.set_val_to(path[path.length-1], "E");

    let string = map.toString();

    add_maze_to_html(string);

    return {
        surrounding: pos_arr,
        start: path[0],
        end: path[path.length - 1],
        map_string: string,
        rows: rows,
        cols: cols,
    };
}