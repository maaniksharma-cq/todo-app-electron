#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main() {
    const char *names[] = {
        "Maanik",
        "Rahul",
        "Aman",
        "Neha",
        "Priya",
        "Rohit",
        "Ankit",
        "Simran"
    };

    int count = sizeof(names) / sizeof(names[0]);

    srand(time(NULL));
    int index = rand() % count;

    printf("Random name is %s\n", names[index]);

    return 0;
}
