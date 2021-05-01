


### Log in as root

    ssh root@<ip>

    # install toosl we will need
    pacman -S sudo make gcc

    # add user
    export USER=jaime
    useradd -m $USER
    passwd $USER

    # add user to sudoers
    export EDITOR='tee -a'
    echo "$USER ALL=(ALL:ALL) ALL" | visudo
    exit

### Log back in as user

    ssh jaime@<ip>

    # install pigpio
    bash < (curl -s https://archibold.io/install/aur)
    aur pigpio-git

    # install node packages
    npm install raspi-io johnny-five oled-js oled-font-5x7
