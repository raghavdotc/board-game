# board-game


##### Steps to Deploy the App

1) Install NodeJS globally on the deploying machine.

```yum install nodejs```

2) Clone this project to the machine.

```git clone https://github.com/raghavdotc/board-game board-game```

3) cd board-game

4) Install Socket.io using

``` npm install socket.io```

5) Install sget using

``` npm install sget ```

6) After this the app should be ready to deploy.

``` node index.js ```

The above command will throw a prompt for configuration of the app.
MaxPlayersAllowed, BlockingTime, BoardSize are the parameters that can be configured at this time.

7) After the prompt is done, the app is ready to be served through port 3000.(Keep the port 3000 open!)

8) Hit the IP of the machine with ```:3000``` (Example : ```127.0.0.1:3000```) on the browser to start playing the game!

