import sockets from '../dist/network_sockets.so';

class TCPConnection {
  constructor(fd, remoteAddr, remotePort) {
    this.fd = fd;
    this.remoteAddr = remoteAddr;
    this.remotePort = remotePort;
    this.buffer = '';
  }

  read(maxBytes = 8192) {
    try {
      const data = sockets.recv(this.fd, maxBytes, 0);
      return data || null;
    } catch (e) {
      return null;
    }
  }

  write(data) {
    try {
      const bytesToSend = typeof data === 'string' ? data : String(data);
      return sockets.send(this.fd, bytesToSend, 0);
    } catch (e) {
      return -1;
    }
  }

  close() {
    try {
      sockets.close(this.fd);
      return true;
    } catch (e) {
      return false;
    }
  }
}

class TCPServer {
  constructor() {
    this.serverFd = null;
    this.epollFd = null;
    this.connections = new Map();
    this.running = false;
    
    this.onConnection = null;
    this.onData = null;
    this.onClose = null;
    this.onError = null;
  }

  listen(port, host = '0.0.0.0') {
    this.serverFd = sockets.socket(sockets.AF_INET, sockets.SOCK_STREAM, 0);
    
    sockets.setsockopt(this.serverFd, sockets.SOL_SOCKET, sockets.SO_REUSEADDR, 1);
    sockets.setsockopt(this.serverFd, sockets.SOL_SOCKET, sockets.SO_REUSEPORT, 1);
    
    sockets.bind(this.serverFd, host, port);
    sockets.listen(this.serverFd, 1024);
    sockets.setnonblocking(this.serverFd);

    this.epollFd = sockets.epoll_create1(0);
    sockets.epoll_ctl(
      this.epollFd,
      sockets.EPOLL_CTL_ADD,
      this.serverFd,
      sockets.EPOLLIN | sockets.EPOLLET
    );

    this.running = true;
    console.log(`TCP Server listening on ${host}:${port}`);

    while (this.running) {
      try {
        const events = sockets.epoll_wait(this.epollFd, 512, 10);

        for (const event of events) {
          if (event.fd === this.serverFd) {
            this._acceptConnections();
          } else {
            this._handleEvent(event);
          }
        }
      } catch (e) {
        if (this.onError) {
          this.onError(e);
        }
      }
    }
  }

  _acceptConnections() {
    while (true) {
      try {
        const client = sockets.accept(this.serverFd);
        if (!client) break;

        sockets.setnonblocking(client.fd);
        sockets.setsockopt(client.fd, sockets.IPPROTO_TCP, sockets.TCP_NODELAY, 1);

        sockets.epoll_ctl(
          this.epollFd,
          sockets.EPOLL_CTL_ADD,
          client.fd,
          sockets.EPOLLIN | sockets.EPOLLET | sockets.EPOLLRDHUP
        );

        const peerAddr = client.address || 'unknown';
        const peerPort = client.port || 0;

        const conn = new TCPConnection(client.fd, peerAddr, peerPort);
        this.connections.set(client.fd, conn);

        if (this.onConnection) {
          this.onConnection(conn);
        }
      } catch (e) {
        break;
      }
    }
  }

  _handleEvent(event) {
    const conn = this.connections.get(event.fd);
    if (!conn) return;

    if (event.events & (sockets.EPOLLERR | sockets.EPOLLHUP | sockets.EPOLLRDHUP)) {
      this._closeConnection(event.fd);
      return;
    }

    if (event.events & sockets.EPOLLIN) {
      try {
        let totalRead = 0;
        const maxRead = 65536;

        while (totalRead < maxRead) {
          const chunk = conn.read(8192);
          if (!chunk || chunk.length === 0) break;

          conn.buffer += chunk;
          totalRead += chunk.length;
        }

        if (this.onData && conn.buffer.length > 0) {
          this.onData(conn);
        }
      } catch (e) {
        this._closeConnection(event.fd);
      }
    }
  }

  _closeConnection(fd) {
    const conn = this.connections.get(fd);
    if (!conn) return;

    try {
      sockets.epoll_ctl(this.epollFd, sockets.EPOLL_CTL_DEL, fd, 0);
    } catch (e) {
    }

    conn.close();
    this.connections.delete(fd);

    if (this.onClose) {
      this.onClose(conn);
    }
  }

  closeConnection(conn) {
    this._closeConnection(conn.fd);
  }

  close() {
    this.running = false;

    for (const [fd] of this.connections) {
      this._closeConnection(fd);
    }

    if (this.epollFd !== null) {
      sockets.close(this.epollFd);
      this.epollFd = null;
    }

    if (this.serverFd !== null) {
      sockets.close(this.serverFd);
      this.serverFd = null;
    }

    console.log('TCP Server closed');
  }
}

function createServer() {
  return new TCPServer();
}

export { createServer, TCPServer, TCPConnection };
export default createServer;
