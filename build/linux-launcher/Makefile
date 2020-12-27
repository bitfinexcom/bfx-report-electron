VERBOSE = TRUE

TARGET := launcher
OBJECTS := $(TARGET).o

CC := gcc
CFLAGS := -g -Wall -no-pie
LIBS := 

RM := rm -rf
ERRIGNORE := 2>/dev/null

ifeq ($(VERBOSE),TRUE)
	HIDE :=
else
	HIDE := @
endif

all: cleanExe $(TARGET) clean

$(TARGET): $(OBJECTS)
	$(HIDE)$(CC) $(CFLAGS) -o $@ $(OBJECTS) $(LIBS)

cleanExe:
	$(HIDE)$(RM) $(TARGET) $(ERRIGNORE)

clean:
	$(HIDE)$(RM) *.o $(ERRIGNORE)
