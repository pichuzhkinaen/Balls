window.addEventListener('DOMContentLoaded', function() {
    'use strict';

    let table = document.querySelector('.area'),
        balls = [],
        areaStringCount = 10, //количество строк
        areaCellCount = 10, //количество ячеек
        n = 0, //счетчик шагов
        k, //счетчик убранных шариков за 1 раз
        score = 0; //очки


    function initializationGame() {
        //сoздание строк и ячеек в них, присваивание id
        for (let a = 0; a < areaStringCount; a++) {
            let string = document.createElement('tr');

            string.className = 'area__string';
            table.appendChild(string);

            for (let b = 0; b < areaCellCount; b++) {
                let cell = document.createElement('td');

                cell.className = 'area__cell';
                cell.id = b + '_' + a; //b = x, a = y
                string.appendChild(cell);
            }
        }
    }


    //случайное число
    function getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    //то что происходит при клике на шар
    function clickBall(){
        
        let target = event.target;

        target = target.parentElement; //если таргет на шарике, таргетом считать его родителя (ячейку), которой ниже присвоится id

        let BallIdClick = [target.id],
            BallColorClick = target.getElementsByTagName('div')[0].className;

        //счетчик вызовов функции checkNeighbors, чтобы удалять шарик не сразу при клике, а после проверки соседей
        let m = 0;
        k = 0; //обнуление счетчика убранных за 1 раз шариков
        
        removeBallsChain(BallIdClick, BallColorClick, m); //удаление цепочки шаров

        //console.log('количество шагов = ' + n);
        
        //подсчет очков за шарики
        if (k <= 5) {
            score = score + (k * 10); //сумма предыдущих шариков + убранные шарики * 10 очков
            //console.log('количество убранных шариков = ' + k);
            //console.log('очки = ' + score);
        } else {
            //увеличенные баллы за убранные шарики более 5 шт.
            score = score + ((k - 5) * 10 * 1.5 + 5 * 10); //напр, если убрали 10 шариков, получится 10 - 5 = 5
            // console.log('количество убранных шариков = ' + k);
            // console.log('очки = ' + score);
        }
        scoreboard(); //табло с подсчетом шагов и очков
        
        createBalls(); //создание новых шарикоф

        //проверка шариков на наличие соседей. если одинаковых шариков в таблице нет, вывести сообщение о победе
        let cells = document.querySelectorAll('.area__cell'),
            cellNeighbours;
            
        for (let h = 0; h < cells.length-1; h++) {
            //собранные в getNeighbours() соседи
            cellNeighbours = getNeighbours(cells[h].id);
            //если соседи существуют остановить дальнейший цикл проверки наличия соседей
            if (cellNeighbours.length > 0) {
                break;
            }
        }
        //условие вывода модального окна об окончании игры
        if (cellNeighbours.length == 0) {
            openModal();
        }
    }


    //сбор соседей
    function getNeighbours(cellId) {

        let arr = cellId.split('_'), //убран разделитель "_", получился массив из 2 элементов id — ["4", "5"], с индексами 0 и 1
            neighbours = []; //массив с id соседей с цветом таргета
            
        //переменные, содержащие id соседних ячеек. Унарный + (+arr) для преобразования строки в число
        let leftElemId = [ +arr[0] - 1 , (+arr[1]) ],
            rightElemId = [ +arr[0] + 1 , (+arr[1]) ],
            topElemId = [ +arr[0] , (+arr[1] - 1) ],
            bottomElemId = [ +arr[0] , (+arr[1] + 1) ],
            elemId = [leftElemId, rightElemId, topElemId, bottomElemId];

        //сбор соседей в массив
        for (let e = 0; e < elemId.length; e++) {
                //проверка ячеек id, ячейка должна находится в таблице (по выбранному в условии диапазону, не выходить за пределы таблицы)
            if (((elemId[e][0] >= 0) && (elemId[e][0] <= (areaCellCount - 1))) && ((elemId[e][1] >= 0) && (elemId[e][1] <= (areaStringCount - 1)))) {                        
                
                let neighboursId = [ elemId[e][0] + '_' + elemId[e][1]]; //перевод id в строковое значение
                //если шарик есть (не убран) и подходит по цвету добавляем его в массив соседей
                if (document.getElementById(neighboursId).getElementsByTagName('div')[0] != null) {
                    let neighboursColor = document.getElementById(neighboursId).getElementsByTagName('div')[0].className;
                    if (neighboursColor == document.getElementById(cellId).getElementsByTagName('div')[0].className) {
                        neighbours.push( neighboursId );
                    }
                }  
            }
        }
       return neighbours;
    }
        

    //поиск соседних шариков с указанным цветом и их удаление
    function removeBallsChain (BallIdClick, BallColorClick, m) {

        //пробегаем по массиву, чтобы учесть всех совпавших по цвету соседей
        for (let h = 0; h < BallIdClick.length; h++) {
           
            //если шарик еще не удален, то выполнить действия... решена проблема, если у двух шариков один и тот же сосед (происходит, когда шарики встают квадратом)
            if (document.getElementById(BallIdClick[h]).getElementsByTagName('div')[0] != null) {
                //собранные в getNeighbours соседи 
                let cellNeighbours = getNeighbours(BallIdClick[h], BallColorClick);

                //если функция вызывается не первый раз, то удаляем шарик, т.е. при первом клике шарик не удаляется и функция проверяет его соседей, находит его же
                if (m > 0) {
                    document.getElementById(BallIdClick[h]).removeChild(document.getElementById(BallIdClick[h]).getElementsByTagName('div')[0]); //исчезает шарик, id которого передан в функцию
                    k++;
                }
                
                //подсчет шагов происходит, когда m = 1, т.е. после того, как проверено наличие соседей
                if (m == 1) {
                    n++;
                }
            
                //если соседи существуют (длина соседей для данной ячейки)
                if (cellNeighbours.length != 0) {

                    //перевод массива с id  в строчное значение
                    let neig = '',
                        neigArr = [];

                    for (let f = 0; f < cellNeighbours.length; f++) {
                        neig = String(cellNeighbours[f]);
                        neigArr.push(neig);
                    }
                    
                    //console.log('neigArr = ' + neigArr);
                    m++;
                    removeBallsChain (neigArr, BallColorClick, m);
                }
            }
        }
    }


    function createBalls() {

        for (let a = 0; a < areaStringCount; a++) {

            for (let b = 0; b < areaCellCount; b++) {
                let cellId = b + '_' + a;

                if (document.getElementById(cellId).getElementsByTagName('div')[0] == null) {

                    let ballRed = document.createElement('div'),
                        ballGreen = document.createElement('div'),
                        ballBlue = document.createElement('div'),
                        ballYellow = document.createElement('div'),
                        ballPurple = document.createElement('div');

                    ballRed.className = 'area__ball-red';
                    ballGreen.className = 'area__ball-green';
                    ballBlue.className = 'area__ball-blue';
                    ballYellow.className = 'area__ball-yellow';
                    ballPurple.className = 'area__ball-purple';

                    //создан массив, из которого в рандомном порядке выбираются шарики
                    balls = [ballRed, ballGreen, ballBlue, ballYellow, ballPurple];

                    //вызов функции для генерации случайного числа в диапазоне от 0 индекса массива до длины массива -1
                    let randomBall = getRandomInteger(0, balls.length - 1);

                    document.getElementById(cellId).appendChild(balls[randomBall]);
                    balls[randomBall].addEventListener('click', clickBall);
                }
            }
        }
    }


    function openModal() {
        modal.style.display = "block";
        overlay.style.display = "block";
        
        let btn = document.getElementById('btn');
        btn.onclick = function() {
            location.href = 'http://127.0.0.1:5500/';
        };
    }


    //вывод подсчета шагов и очков в табло
    function scoreboard() {
        let steps = document.querySelector('.steps'),
            points = document.querySelector('.points');

            steps.innerHTML = n;
            points.innerHTML = score;
    }


    initializationGame();
    

    createBalls();

});