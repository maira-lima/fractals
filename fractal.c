/* fractal.c
 * Gera uma imagem formato BMP com um fractal L-system
 *
 * Autora: Maira Zabuscha de Lima
 * Data: 29/11/2016
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

#define PI 3.14159265

//alocar 10MB de memoria pra calcular a string de intrucoes
#define MEM 10240000

typedef struct _System {
    int w;
    int h;
    int n;
    char *axiom;
    int ao;
    int rules;
    char **from;
    char **to;
    int angle;
    char *result;
    int tam;
    int xo;
    int yo;
    int l;
    int segmentos;
} System;

typedef struct _BitmapHeader {
    unsigned char signature[2];
    unsigned int size;
    char reserved[4];
    unsigned int offset;
} BitmapHeader;

typedef struct _DIB {
    unsigned int sizeheader;
    unsigned int width;
    unsigned int height;
    unsigned short planes;
    unsigned short bpp;
    unsigned int compression;
    unsigned int imgsize;
    unsigned int hppm;
    unsigned int vppm;
    unsigned int n_colors;
    unsigned int n_important_colors;
} DIB;

#pragma pack(1)
typedef struct _Color {
    unsigned char blue;
    unsigned char green;
    unsigned char red;
} Color;

int menu(char *origem);
void imprimeSystem(System *system);
void imprimeHeader(BitmapHeader *header, DIB *dib);
int result(System *system);
void dimensoes(System *system);
void setHeader(BitmapHeader *header, DIB *dib, int w, int h);
Color *desenhar(System *system, BitmapHeader *header, DIB *dib, int f);
int gravaBMP(char imagem[], BitmapHeader *header, DIB *dib, Color *pixels);
int leArquivo(char origem[], System *system);
void freesystem(System *system);

int main (int argc, char **argv) {
    char resultado[40];
    char origem[30];
    char ext[9];
    BitmapHeader header;
    DIB dib;
    Color *pixels;
    System system;
    int w, h, s, o, f;
    
    // verifica se o programa foi iniciado com argumento
    if (argc > 1 && strlen(argv[1]) > 4) {
        strcpy(origem, argv[1]);
        o = 17;
        printf("\n");
    }
    
    // se nao foi iniciado com argumento, gera um menu com opcoes basicas
    else {
        printf("\nEspecifique o arquivo texto de instrucoes assim: %s arquivo.txt\n", argv[0]);
        o = menu(origem);
    }
    if (o) {
        
        // le o arquivo texto com as especificacoes do L-system, verifica se houve sucesso
        if (leArquivo(origem, &system)) { // aloca system->axiom, system->from, system->to, r*system->from[i], r*system->to[i]
            
            // mostra as especificacoes lidas
            imprimeSystem(&system);
            
            // o usuario define tamanho da imagem e numero de iteracoes que define a complexidade do fractal
            printf("Largura maxima da imagem: ");
            scanf("%d", &(system.w));
            // nao vamos deixar o usuario escolher uma imagem menor que 100 pixels!
            if (system.w < 100) system.w = 100;
            printf("Numero de iteracoes: ");
            scanf("%d", &(system.n));
            
            f = 0; // 0 nao grava frames
            /* se for tirado o comentario das linhas abaixo, o programa podera salvar em torno
             * de 120 imagens intermediárias para serem usadas na criacao de um gif animado
             * mostrando o processo do desenho do fractal, que pode ser criado em um programa
             * externo, esse nao faz o gif.
             */
            //printf("Gravar frames (0 - nao, 1 - sim): ");
            //scanf("%d", &f);
            
            // gera a string final, baseado nas regras do L-system e no numero de iteracoes, verfica se houve sucesso
            if (result(&system)) { // aloca system->result
                
                //calcula as dimensoes reais que a imagem final ira ter, o usuario definiu apenas o max
                dimensoes(&system);
                w = system.w;
                h = system.h;
                
                // gera o header padrao do formato BMP
                setHeader(&header, &dib, w, h);
                
                // colore os pixels da imagem, de acordo com as regras da string gerada acima, verifica se houve sucesso
                if (pixels = desenhar(&system, &header, &dib, f)) { // aloca pixels
                    
                    // define o nome da imagem gerada a partir do nome do arquivo de texto e o num de iteracoes
                    strcpy(resultado, origem);
                    s = strlen(resultado);
                    resultado[s-4] = 0;
                    sprintf(ext, "-%.2d.bmp", system.n);
                    strcat(resultado, ext);
                    
                    // mostra as propriedades do BMP gerado
                    imprimeHeader(&header, &dib);
                    
                    // grava o arquivo binario formato BMP em disco
                    gravaBMP(resultado, &header, &dib, pixels);
                    
                    free(pixels); // libera pixels
                }
                else return 1;
                free(system.result); // libera system->result
            }
            else return 1;
            freesystem(&system); // libera system->axiom, system->from, system->to, r*system->from[i], r*system->to[i]
        }
        else return 1;
        printf("\n");
        return 0;
    }
    else return 1;
}


// exibe o menu de opcoes basicas
int menu(char *origem) {
    int o = 0;
    printf("Ou selecione um L-System abaixo (0 para sair)\n");
    printf(" 1 Cesaro Curve\n");
    printf(" 2 Dekkings Church\n");
    printf(" 3 Dragon Curve\n");
    printf(" 4 Gosper Curve\n");
    printf(" 5 Hilbert Curve\n");
    printf(" 6 Koch Curve\n");
    printf(" 7 Moore Curve\n");
    printf(" 8 Pentigree\n");
    printf(" 9 Fractal Plant\n");
    printf("10 Pythagoras Tree\n");
    printf("11 Quadratic Gosper Curve\n");
    printf("12 Quadratic Koch Curve\n");
    printf("13 Quadratic Koch Island\n");
    printf("14 Sierpinski Triangle\n");
    printf("15 Sierpinski Triangle V2\n");
    printf("16 XBorder\n");
    printf("L-System: ");
    scanf("%d", &o);
    if (o == 1) strcpy(origem, "cesaro.txt");
    else if (o == 2) strcpy(origem, "dekkings.txt");
    else if (o == 3) strcpy(origem, "dragon.txt");
    else if (o == 4) strcpy(origem, "gosper.txt");
    else if (o == 5) strcpy(origem, "hilbert.txt");
    else if (o == 6) strcpy(origem, "koch.txt");
    else if (o == 7) strcpy(origem, "moore.txt");
    else if (o == 8) strcpy(origem, "pentigree.txt");
    else if (o == 9) strcpy(origem, "plant-f.txt");
    else if (o == 10) strcpy(origem, "pythagoras.txt");
    else if (o == 11) strcpy(origem, "qgosper.txt");
    else if (o == 12) strcpy(origem, "qkoch.txt");
    else if (o == 13) strcpy(origem, "qkochisland.txt");
    else if (o == 14) strcpy(origem, "sierpinski.txt");
    else if (o == 15) strcpy(origem, "sierpinski2.txt");
    else if (o == 16) strcpy(origem, "xborder.txt");
    else o = 0;
    return o;
}

// le o arquivo txt em disco com as regras do fractal
// esse arquivo deve obrigatoriamente seguir um padrao pra essa funcao dar certo
// o padrao esta explicado nos arquivos providos juntamente com este codigo fonte
int leArquivo(char origem[], System *system) {
    int r, i, a, controle;
    char buffer[100];
    FILE *arquivo = fopen(origem,"r");
    if(arquivo) {
        printf("Lendo arquivo %s\n", origem);
        fgets(buffer, 100, arquivo);
        controle = 0;
        while (controle < 100 && buffer[0] != '#') {
            fgets(buffer, 100, arquivo);
            controle++;
        }
        if (controle == 100) {
            printf("O arquivo %s nao segue as especificacoes\n", origem);
            return 0;
        }
        fscanf(arquivo, "%s", buffer);
        a = strlen(buffer);
        if (system->axiom = (char *)malloc((a+1)*sizeof(char))) {
            strcpy(system->axiom, buffer);
        }
        else return 0;
        fscanf(arquivo, "%d", &(system->ao));
        fscanf(arquivo, "%d", &r);
        system->rules = r;
        if ((system->from = (char **)malloc(r*sizeof(char *))) && (system->to = (char **)malloc(r*sizeof(char *)))) {
            for (i = 0; i < r; i++) {
                fscanf(arquivo, "%s", buffer);
                a = strlen(buffer);
                if ((system->from)[i] = (char *)malloc((a+1)*sizeof(char))) {
                    strcpy((system->from)[i], buffer);
                }
                else return 0;
                fscanf(arquivo, "%s", buffer);
                a = strlen(buffer);
                if ((system->to)[i] = (char *)malloc((strlen(buffer)+1)*sizeof(char))) {
                    strcpy((system->to)[i], buffer);
                }
                else return 0;
            }
        }
        else return 0;
        fscanf(arquivo, "%d", &(system->angle));
        fclose(arquivo);
        return 1;
    }
    else {
        printf("Nao foi possivel abrir o arquivo %s\n", origem);
        return 0;
    }
}

// produz a string final com todas as instrucoes a partir do txt e do numero de iteracoes
// se a string resultante ultrapassa MEM bytes, reduz automaticamente o numero de iteracoes
int result (System *system) {
    int i, j, k, m, c, l, t, replaced, stop, instrucoes;
    char *reading;
    char *writing;
    if ((reading = (char *)malloc(MEM*sizeof(char))) && (writing = (char *)malloc(MEM*sizeof(char)))) {
        printf("Calculando string resultante\n");
        stop = 0;
        strcpy(reading, system->axiom);
        l = strlen(reading);
        instrucoes = l;
        for (i = 0; i < system->n && !stop; i++) {
            c = 0;
            for (j = 0; j < l && c < MEM-2; j++) {
                replaced = 0;
                for (k = 0; !replaced && k < system->rules && c < MEM-2; k++) {
                    if (reading[j] == system->from[k][0]) {
                        t = strlen(system->to[k]);
                        for (m = 0; m < t; m++) {
                            writing[c] = system->to[k][m];
                            c++;
                        }
                        writing[c] = '\0';
                        replaced = 1;
                    }
                }
                if (!replaced) {
                    writing[c] = reading[j];
                    c++;
                }
                if (c >= MEM-1) {
                    printf("Nao foi possivel calcular toda a string com a memoria disponivel (%d bytes). Reduzindo iteracoes para: %d\n", MEM, i);
                    system->n = i;
                    stop = 1;
                }
            }
            l = c;
            if (c >= MEM) c = MEM - 1;
            writing[c] = '\0';
            if (!stop) {
                strcpy(reading, writing);
                instrucoes = c;
            }
        }
        free(writing);
        if (system->result = (char *)malloc((instrucoes+1)*sizeof(char))) {
            strcpy(system->result, reading);
            system->tam = instrucoes;
            free(reading);
            return 1;
        }
        else {
            printf("Nao foi possivel calcular a string\n");
            free(reading);
            return 0;
        }
    }
    else {
        printf("Nao foi possivel calcular a string\n");
        return 0;
    }
}

// calcula as dimensoes reais da imagem e gera as coordenadas de onde onde o desenho comeca
// verifica se a quantidade de iteracoes selecionada ira gerar segmentos menores que 1 pixel
// se sim, chama a funcao que calcula a string novamente, com menos iteracoes
void dimensoes(System *system) {
    int i, j, k, l, c, angulo, seg;
    double backup[3][100];
    double an, f1, f2, f, x, y, x_max, x_min, y_max, y_min;
    char atual;
    // o tamanho inicial dos segmentos eh 100
    // ao final temos o fator multiplicativo f q pode aumentar ou diminuir l
    l = 100, seg = 0;
    printf("Calculando dimensoes\n");
    for (k = 0; l > 1 && k < 2; k++) {
        c = 0, x = 0, y = 0, x_max = 0, x_min = 0, y_max = 0, y_min = 0, angulo = system->ao;
        for (i = 0; i < (system->tam); i++) {
            an = ((double)angulo)/180*PI;
            atual = system->result[i];
            if (atual == 'F' || atual == 'G' || atual =='M') {
                x = x + l*cos(an);
                y = y + l*sin(an);
                if (x < x_min) x_min = x;
                if (x > x_max) x_max = x;
                if (y < y_min) y_min = y;
                if (y > y_max) y_max = y;
                if (atual == 'F' || atual == 'G') seg++;
            }
            else if (atual == '+') {
                angulo += system->angle;
                if (angulo > 360) angulo -= 360;
            }
            else if (atual == '-') {
                angulo -= system->angle;
                if (angulo < 0) angulo += 360;
            }
            else if (atual == '[') {
                backup[0][c] = x;
                backup[1][c] = y;
                backup[2][c] = angulo;
                c++;
            }
            else if (atual == ']') {
                c--;
                x = backup[0][c];
                y = backup[1][c];
                angulo = backup[2][c];
            }
        }
        if (k == 0) {
            f1 = ((system->w)-40)/(x_max - x_min);
            f2 = ((system->w)-40)/(y_max - y_min);
            if (f1 > f2) f = f2;
            else f = f1;
            l = (l*f);
            system->l = l;
            system->segmentos = seg;
        }
    }
    if (l < 2) {
        free(system->result);
        if (system->n > 0) {
            system->n--;
            printf("Os segmentos sao menores que 1 pixel. Reduzindo iteracoes para: %d\n", system->n);
            result(system);
             // essa funcao eh recursiva, diminui o num de iteracoes ate achar tam de segmento positivo
             // ou ate o num de iteracoes ter sido reduzido a zero
            dimensoes(system);
        }
    }
    else {
        system->xo = 20 - x_min;
        system->yo = 20 - y_min;
        system->w = x_max - x_min + 40;
        system->h = y_max - y_min + 40;
    }
}


// grava no vetor de 3 posicoes dado uma tripla rgb
// as cores mudam de acordo com o parametro i dado, seguindo a ordem do espectro, de vermelho a roxo
void color(unsigned char *v, int i) {
    if (i < 256) {
        v[0] = 255;
        v[1] = i;
        v[2] = 0;
    }
    else if (i < 511) {
        v[0] = 510 - i;
        v[1] = 255;
        v[2] = 0;
    }
    else if (i < 766) {
        v[0] = 0;
        v[1] = 255;
        v[2] = i - 510;
    }
    else if (i < 1021) {
        v[0] = 0;
        v[1] = 1020 - i;
        v[2] = 255;
    }
    else if (i < 1276) {
        v[0] = i - 1020;
        v[1] = 0;
        v[2] = 255;
    }
    else if (i < 1531) {
        v[0] = 255;
        v[1] = 0;
        v[2] = 1530 - i;
    }
    else {
        v[0] = 255;
        v[1] = 255;
        v[2] = 255;
    }
}

// cria o array de pixels e altara a cor deles de acordo com as regras da string resultante
Color *desenhar(System *system, BitmapHeader *header, DIB *dib, int frames) {
    Color *pixels = NULL;
    int i, j, a, l, bkp_ct, w, p, f, ct_f, ct_seg, color_ct;
    unsigned char colors[3];
    double backup[3][1000];
    //int bkpcolor[1000];
    double an, x, y, xi, yi;
    char atual;
    char frame[13];
    w = system->w; // optei por deixar essas 2 atribuicoes desnecessarias pra reduzir o tamanho das formulas
    l = system->l;
    //f eh usada na frequencia de geracao dos frames, ct_f e ct_seg tambem
    f = system->segmentos / 120;
    if (f < 1) f = 1;
    bkp_ct = 0, color_ct = 0, ct_f = 0, ct_seg = 0, p = w*system->h;
    if (l > 1) {
        if (pixels = (Color *)calloc(p,sizeof(Color))) {
            //todos os pixels da imagem sao pretos inicialmente pois calloc preenche todos os bytes com 0
            //pra fundo de outra cor fazer um for e atribuir cada cor de cada pixel individualmente
            printf("Desenhando %d instrucoes\n", system->tam);
            x = (double)system->xo, y = (double)system->yo, a = system->ao;
            an = ((double)a)/180*PI;
            p = (w*(int)round(y))+(int)round(x);
            color(colors, color_ct);
            pixels[p].red = colors[0];
            pixels[p].green = colors[1];
            pixels[p].blue = colors[2];
            for (i = 0; i < system->tam; i++) {
                atual = system->result[i];
                if (atual == 'F' || atual == 'G') {
                    xi = x, yi = y;
                    for (j = 1; j <= l; j++) {
                        x = xi + j*cos(an);
                        y = yi + j*sin(an);
                        p = (w*(int)round(y))+(int)round(x);
                        pixels[p].red = colors[0];
                        pixels[p].green = colors[1];
                        pixels[p].blue = colors[2];
                    }
                    if (color_ct++ > 1529) color_ct = 0;
                    ct_seg++;
                    color(colors, color_ct);
                    // esse if soh eh ativado se o usuario quiser gravar frames para gif
                    if (frames && (ct_seg % f == 0 || ct_seg == system->segmentos)) {
                        ct_f++;
                        sprintf(frame, "frame%.3d.bmp", ct_f);
                        gravaBMP(frame, header, dib, pixels);
                    }
                }
                if (atual == 'M') {
                    x = x + l*cos(an);
                    y = y + l*sin(an);
                }
                else if (atual == '+') {
                    a += system->angle;
                    if (a > 360) a -= 360;
                    an = ((double)a)/180*PI;
                }
                else if (atual == '-') {
                    a -= system->angle;
                    if (a < 0) a += 360;
                    an = ((double)a)/180*PI;
                }
                else if (atual == '[') {
                    backup[0][bkp_ct] = x;
                    backup[1][bkp_ct] = y;
                    backup[2][bkp_ct] = a;
                    //bkpcolor[bkp_ct] = color_ct;
                    bkp_ct++;
                }
                else if (atual == ']') {
                    bkp_ct--;
                    x = backup[0][bkp_ct];
                    y = backup[1][bkp_ct];
                    a = backup[2][bkp_ct];
                    an = ((double)a)/180*PI;
                    //color_ct = bkpcolor[bkp_ct];
                }
            }
        }
        else printf("Erro ao alocar memoria para os pixels\n");
    }
    else printf("Nao foi possivel fazer o desenho pois os segmentos tem tamanho menor que 1 pixel\n");
    return pixels;
}


// imprime na tela as informacoes do L-system usado
void imprimeSystem(System *system) {
    int i;
    printf("Axioma: %s\n", system->axiom);
    printf("Angulo inicial: %d\n", system->ao);
    printf("Regras: %d\n", system->rules);
    for (i = 0; i < system->rules; i++) {
        printf("Regra %d: %s -> ", i+1, system->from[i]);
        printf("%s\n", system->to[i]);
    }
    printf("Angulo: %d\n", system->angle);
}

// define o header padrao do formato BMP
void setHeader(BitmapHeader *header, DIB *dib, int w, int h) {
    //o padding eh necessario pois cada linha de pixels deve ser multiplo de 4 bytes
    //e cada pixel de 24 bpp tem 3 bytes
    int pad = w % 4;
    header->signature[0] = 'B';
    header->signature[1] = 'M';
    header->size = (((w*3)+pad)*h) + 54;
    memset(header->reserved, 0, 4);
    header->offset = 54;
    dib->sizeheader = 40;
    dib->width = w;
    dib->height = h;
    dib->planes = 1;
    dib->bpp = 24;
    dib->compression = 0;
    dib->imgsize = ((w*3)+pad)*h;
    dib->hppm = 0;
    dib->vppm = 0;
    dib->n_colors = 0;
    dib->n_important_colors = 0;
}

// mostra na tela as informacoes especificas desse BMP
void imprimeHeader(BitmapHeader *header, DIB *dib) {
    printf("Tamanho da imagem: %d bytes\n", header->size);
    printf("Largura: %d pixels\n", dib->width);
    printf("Altura: %d pixels\n", dib->height);
    printf("Bits per pixel: %d\n", dib->bpp);
}

// grava em disco o arquivo binario formato BMP usando o array de cores ja com a imagem
int gravaBMP(char imagem[], BitmapHeader *header, DIB *dib, Color *pixels) {
    //o padding eh necessario pois cada linha de pixels deve ser multiplo de 4 bytes
    //e cada pixel de 24 bpp tem 3 bytes
    FILE *arquivo = fopen(imagem,"wb");
    int i, j, h, w, p, pad;
    char padding[3] = {0, 0, 0};
    h = dib->height;
    w = dib->width;
    pad = w % 4;
    if(arquivo) {
        printf("Escrevendo arquivo %s\n",imagem);
        fwrite(header->signature,1,2,arquivo);
        fwrite(&header->size,1,4,arquivo);
        fwrite(header->reserved,4,1,arquivo);
        fwrite(&header->offset,1,4,arquivo);
        fwrite(&dib->sizeheader,1,4,arquivo);
        fwrite(&dib->width,1,4,arquivo);
        fwrite(&dib->height,1,4,arquivo);
        fwrite(&dib->planes,1,2,arquivo);
        fwrite(&dib->bpp,1,2,arquivo);
        fwrite(&dib->compression,1,4,arquivo);
        fwrite(&dib->imgsize,1,4,arquivo);
        fwrite(&dib->hppm,1,4,arquivo);
        fwrite(&dib->vppm,1,4,arquivo);
        fwrite(&dib->n_colors,1,4,arquivo);
        fwrite(&dib->n_important_colors,1,4,arquivo);
        for (i = 0; i < h; i++) {
            for (j = 0; j < w; j++) {
                p = (w*i)+j;
                fwrite(&(pixels[p].blue),1,1,arquivo);
                fwrite(&(pixels[p].green),1,1,arquivo);
                fwrite(&(pixels[p].red),1,1,arquivo);
            }
            fwrite(padding,1,pad,arquivo);
        }
        fclose(arquivo);
        return 1;
    }
    else {
        printf("Nao foi possivel abrir o arquivo %s\n", imagem);
        return 0;
    }
}

// libera mallocs de arrays
void freesystem(System *system) {
    int i, r;
    r = system->rules;
    free(system->axiom);
    for (i = 0; i < r; i++) {
        free(system->from[i]);
        free(system->to[i]);
    }
    free(system->from);
    free(system->to);
}