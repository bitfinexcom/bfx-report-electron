#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>

void msgBox(char *s){
  char cmd[1024];
  sprintf(cmd, "./msg-box.sh \"%s\"", s);

  int state = system(cmd);

  if (state) {
    system("zenity --error --ellipsize --text=\"Error with msg-box.sh\"");
  }
}

int main(int argc, char *argv[]) {
  errno = 0;

  char *programName = "./launcher.sh";
  char *args[] = { programName, NULL };
 
  execvp(programName, args);
  perror(programName);
  
  char *errMess = strerror(errno);
  char mess[1024];

  sprintf(mess, "%s: %s", programName, errMess);
  msgBox(mess);

  exit(1);
}
