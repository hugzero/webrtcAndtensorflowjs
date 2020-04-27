//canvas初始化
// const canvas = document.getElementById("output");
// const ctx = canvas.getContext("2d");
/**
 * 判断多人的情况
 * @type {string}
 */
const color = 'red';
const lineWidth = 2;
const boundingBoxColor = 'red';
//初始化视频设置
const videoWidth = 480;
const videoHeight = 360;

const xpoint1 = videoWidth / 4;
const ypoint1 = videoHeight / 4;
const xpoint2 = videoWidth * 3 / 4;
// const ypoint2 = videoHeight * 3 / 4;

//修改该值能够判断最大y的范围
const ypoint2 = videoHeight * 5 / 6;

const twoHips = "AKIMBO"; //叉腰
const rightHips = "LEG_RIGHT_LIFTING";//叉右腰
const leftHips = "LEG_LEFT_LIFTING";//叉左腰
const flatRightLeg = "FLAT_RIGHT_LEG";//举右腿
const flatLeftLeg = "FLAT_LEFT_LEG";//举左腿
const raiseArms = "RAISE_ARMS"; //举双臂
const raiseRightArms = "RAISE_RIGHT_ARMS"//  抬右臂
const raiseLeftArms = "RAISE_LEFT_ARMS"//  抬左臂
const parallelRightArms = "PARALLEL_RIGHT_ARMS";//  平举右臂
const parallelLeftArms = "PARALLEL_LEFT_ARMS";//  平举左臂
const parallelAllArms = "PARALLEL_ALL_ARMS";//  平举双臂
const otherRightMotion = "OTHERRIGHTMOTION";
const otherLeftMotion = "OTHERLEFTMOTION";
const otherMotion = "OTHERMOTION";

var leftshoulderX;//5左肩
var leftshoulderY;//5左肩
var rightshoulderY;//6右肩
var rightshoulderX;//6右肩
var leftElbowX;//7左肘
var leftElbowY;//7左肘
var rightElbowX;//8右肘
var rightElbowY;//8右肘
var rightWristY;//10右腕
var rightWristX;//10右腕
var leftHipX;//11左髋
var leftHipY;//11左髋
var rightHipX;//右髋
var rightHipY;//右髋
var leftWristX;//9左腕
var leftWristY;//9左腕
var leftKneeX;//13左膝
var leftKneeY;//13左膝
var rightKneeX;//14右膝
var rightKneeY;//14右膝
var leftAnkleX;//15左脚踝
var leftAnkleY;//15左脚踝
var rightAnkleX;//16右脚踝x
var rightAnkleY;//16右脚踝y


var gestureArmBothHold = true;

// 5左肩 6右肩 7左肘 8右肘 9左腕 10右腕 11左髋 12右髋 13左膝 14右膝 15左脚踝 16右脚踝
async function setupCamera() {
    const video = document.getElementById('video');
    video.width = videoWidth;
    video.height = videoHeight;
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

//加载播放视频
async function loadVideo() {
    const video = await setupCamera();
    return video;
}


//视频实时加载
function detectPoseInRealTime(video, net) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');
    const flipPoseHorizontal = true;
    canvas.width = videoWidth;
    canvas.height = videoHeight;


    async function poseDetectionFrame() {
        let poses = [];
        let minPoseConfidence;
        let minPartConfidence;
        /**
         * flipHorizontal 是否镜像翻转
         * maxDetections 最大检测数
         * scoreThreshold 得分超过0.5
         * nmsRadius
         */
        let all_poses = await net.estimatePoses(video, {
            flipHorizontal: flipPoseHorizontal,
            maxDetections: 2,
            scoreThreshold: 0.4,
            nmsRadius: 30
        });
        poses = poses.concat(all_poses);
        //if poses ==1
        if (poses.length >= 1) {
            if (initVal(poses)){
                //腕肩胯角度
                var leftArmParallelAngleA = angleCalculation(leftWristX, leftWristY, leftshoulderX, leftshoulderY, leftHipX, leftHipY);// 5左肩 6右肩 7左肘 8右肘 9左腕 10右腕 11左髋 12右髋 13左膝 14右膝 15左脚踝 16右脚踝
                var leftArmParallelAngleB = angleCalculation(leftElbowX, leftElbowY, leftshoulderX, leftshoulderY, leftHipX, leftHipY);// 5左肩 6右肩 7左肘 8右肘 9左腕 10右腕 11左髋 12右髋 13左膝 14右膝 15左脚踝 16右脚踝
                var rightArmParallelAngleA = angleCalculation(rightWristX, rightWristY, rightshoulderX, rightshoulderY, rightHipX, rightHipY);
                var rightArmParallelAngleB = angleCalculation(rightElbowX, rightElbowY, rightshoulderX, rightshoulderY, rightHipX, rightHipY);

                //腿弯曲角度
                var rightHipsLeg = angleCalculation(rightAnkleX, rightAnkleY, rightKneeX, rightKneeY, rightHipX, rightHipY);
                var leftHipsLeg = angleCalculation(leftAnkleX, leftAnkleY, leftKneeX, leftKneeY, leftHipX, leftHipY);

                //判断 肩膀胯膝盖的角度小于90
                var rightShoulderHipKneeAngle = angleCalculation(rightKneeX, rightKneeY, rightHipX, rightHipY, rightshoulderX, rightshoulderY);
                var leftShoulderHipKneeAngle = angleCalculation(leftKneeX, leftKneeY, leftHipX, leftHipY, leftshoulderX, leftshoulderY);

                //叉腰角度
                var leftHipsAngle = angleCalculation(leftWristX, leftWristY, leftElbowX, leftElbowY, leftshoulderX, leftshoulderY);
                var rightHipsAngle = angleCalculation(rightWristX, rightWristY, rightElbowX, rightElbowY, rightshoulderX, rightshoulderY);
                /**
                 * 判断右手平行条件：手腕和身长的夹角在80-100度之间
                 */
                var isLeftArmParallel = armParallel(leftArmParallelAngleA, leftArmParallelAngleB, rightArmParallelAngleB);
                var isRightArmParallel = armParallel(rightArmParallelAngleA, rightArmParallelAngleB, leftArmParallelAngleB);
                /**
                 *   是否举手,1.高度差2.叉腰夹角 大于160 ，3.肘肩胯之间的夹角 大于100
                 */
                var isRightHandRaise = raiseHand(rightshoulderY, rightElbowY, rightWristY, rightArmParallelAngleB, leftArmParallelAngleB);
                var isLeftHandRaise = raiseHand(leftshoulderY, leftElbowY, leftWristY, leftArmParallelAngleB, rightArmParallelAngleB);

                /**
                 * 判断是否触发特殊动作
                 */
                var isSpLeftMotion = spRightMotion(leftHipsAngle, leftArmParallelAngleB, rightArmParallelAngleB, rightHipsAngle, leftHipsLeg, leftShoulderHipKneeAngle);
                var isSpRightMotion = spRightMotion(leftHipsAngle, rightHipsAngle, leftArmParallelAngleB, rightArmParallelAngleB, rightHipsLeg, rightShoulderHipKneeAngle);

                var isNormalMotion = normalMotion(leftArmParallelAngleB, rightArmParallelAngleB, leftShoulderHipKneeAngle, rightShoulderHipKneeAngle);
                /**
                 *  判断伸左右平举
                 */
                if (isLeftArmParallel) {
                    if (gestureArmBothHold) {
                        gestureArmBothHold = false;
                        console.log("平举左手");
                        callAjax(parallelLeftArms);
                    }
                } else if (isRightArmParallel) {
                    if (gestureArmBothHold) {
                        gestureArmBothHold = false;
                        console.log("平举右手");
                        callAjax(parallelRightArms);
                    }
                } else if (judgmentAngleRange(leftArmParallelAngleA, 80, 100) && judgmentAngleRange(rightArmParallelAngleA, 80, 100)) {
                    if (gestureArmBothHold) {
                        gestureArmBothHold = false;
                        console.log("平举双手");
                        callAjax(parallelAllArms);
                    }
                } else if (isRightHandRaise && !isLeftHandRaise && judgmentAngleLessThan(leftArmParallelAngleB, 60)) {
                    if (gestureArmBothHold) {
                        gestureArmBothHold = false;
                        console.log("举右手:");
                        callAjax(raiseRightArms);
                    }
                } else if (!isRightHandRaise && isLeftHandRaise && judgmentAngleLessThan(rightArmParallelAngleB, 60)) {
                    if (gestureArmBothHold) {
                        gestureArmBothHold = false;
                        console.log("举左手:");
                        callAjax(raiseLeftArms);
                    }
                } else if (isRightHandRaise && isLeftHandRaise) {
                    if (gestureArmBothHold) {
                        gestureArmBothHold = false;
                        console.log("举双手:");
                        callAjax(raiseArms);
                    }
                } else if (isSpLeftMotion) {
                    if (gestureArmBothHold) {
                        gestureArmBothHold = false;
                        console.log("特殊动作左");//
                        callAjax(twoHips);
                    }
                } else if (isSpRightMotion) {
                    if (gestureArmBothHold) {
                        gestureArmBothHold = false;
                        console.log("特殊动作右");
                        callAjax(otherMotion);
                    }
                } else if (isNormalMotion) {
                    if (!gestureArmBothHold) {
                        gestureArmBothHold = true;
                        console.log("正常状态");
                    }
                }
            }
        }


        minPoseConfidence = +0.5;
        minPartConfidence = +0.5;
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-videoWidth, 0);
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        ctx.restore();

        ctx.strokeStyle = "red";
        ctx.moveTo(0, 90);//x,y
        ctx.lineTo(480, 90);//x,y

        // ctx.moveTo(0 ,180);
        // ctx.lineTo(480,180);
        //
        // ctx.moveTo(0 ,270);
        // ctx.lineTo(480,270);

        ctx.moveTo(0, 360 * 5 / 6);
        ctx.lineTo(480, 360 * 5 / 6);


        ctx.moveTo(120, 0);//x,y
        ctx.lineTo(120, 360);//x,y

        // ctx.moveTo(240 ,0);
        // ctx.lineTo(240,360);

        ctx.moveTo(360, 0);
        ctx.lineTo(360, 360);


        // ctx.moveTo(0, 120);//x,y
        // ctx.lineTo(480, 120);//x,y
        //
        // ctx.moveTo(0, 240);
        // ctx.lineTo(480, 240);
        //
        // ctx.moveTo(160, 0);//x,y
        // ctx.lineTo(160, 360);//x,y
        //
        // ctx.moveTo(320, 0);
        // ctx.lineTo(320, 360);

        ctx.lineWidth = 1;
        ctx.stroke();

        poses.forEach(({score, keypoints}) => {
            if (score >= minPoseConfidence) {
                drawKeypoints(keypoints, minPartConfidence, ctx);
                drawSkeleton(keypoints, minPartConfidence, ctx);
            }
        });

        requestAnimationFrame(poseDetectionFrame);
    }

    poseDetectionFrame();
}

/**
 * architecture 可以是MobileNetV1或ResNet50。它确定要加载的PoseNet体系结构
 * outputStride 8、16、32之一,值越小越精确，但速度越慢
 * inputResolution 默认值为257。值越大，以速度为代价的模型越精确。
 * multiplier 该值仅由MobileNetV1体系结构使用，而不由ResNet体系结构使用，越大越准确
 * quantBytes 4、 2、 1， 4导致最高的准确性和原始模型的大小（〜90MB）。
 * @returns {Promise<void>}
 */

async function bindPage() {
    const net = await posenet.load({
        architecture: 'ResNet50',
        outputStride: 32,
        inputResolution: 257,
        quantBytes: 2
    });

    document.getElementById('loading').style.display = 'none';
    document.getElementById('main').style.display = 'block';

    let video;

    try {
        video = await loadVideo();
    } catch (e) {
        let info = document.getElementById('info');
        info.textContent = 'this browser does not support video capture,' +
            'or this device does not have a camera';
        info.style.display = 'block';
        throw e;
    }
    detectPoseInRealTime(video, net);
}

/**
 *  * calculationCenterPoint 计算中心点坐标是否在区域内
 *  inTheArea(leftHipX, rightshoulderY, rightshoulderX, leftHipY, xpoint1, ypoint1, xpoint2, ypoint2);
 *  x1 -> leftHipX左胯x ,x2-> rightshoulderX右肩x
 *   */
function inTheArea(x1, y1, x2, y2, x3, y3, x4, y4) {
    var xpoint3;
    if (x2 > x1) {
        xpoint3 = x2 - (x2 - x1) / 2;
    } else if (x1 > x2) {
        xpoint3 = x1 - (x1 - x2) / 2;
    }
    var ypoint3 = y1 + (y2 - y1) / 2;
    if (judgmentAngleRange(xpoint3, x3, x4) && judgmentAngleRange(ypoint3, y3, y4)) {
        return true;
    } else {
        return false;
    }
}

/**
 *
 * @param angleA 左肘肩胯角度
 * @param angleB 右肘肩胯角度
 * @param angleC 左腿角度
 * @param angleD 右腿角度
 */
function normalMotion(angleA, angleB, angleC, angleD) {
    if (judgmentAngleLessThan(angleA, 55) && judgmentAngleLessThan(angleB, 55)
        && judgmentAngleGreaterThan(angleC, 160) && judgmentAngleGreaterThan(angleD, 160)
    ) {
        return true;
    } else {
        return false;
    }
}

/**
 *  70<angleA<110,70<angleB<110
 * 是否触发特殊动作 angleA->左叉腰，angleB->右叉腰,angleC->左平行 ,右平行angleD-> , angleE->抬腿角度,angleF->肩膝胯角度
 */
function spRightMotion(angleA, angleB, angleC, angleD, angleE, angleF) {
    if (judgmentAngleRange(angleA, 70, 115) && judgmentAngleRange(angleB, 70, 115)
        && judgmentAngleLessThan(angleE, 110) && judgmentAngleLessThan(angleF, 160)) {
        return true;
    } else {
        return false;
    }
}

/**
 * 平举判断,腕肩胯角度在80-100之间 angleA->一只手平举角度，angleB -> 肘肩胯角度 angleC->另一只手平举角度
 */
function armParallel(angleA, angleB, angleC) {
    if (judgmentAngleRange(angleA, 80, 110) && judgmentAngleRange(angleB, 80, 110) && judgmentAngleLessThan(angleC, 50)) {
        return true;
    } else {
        return false;
    }
}

/**
 * angleB ->肘肩胯夹角120-180,angleC -> 另一只肘肩胯夹角
 */
function raiseHand(shoulderY, elbowY, wristY, angleA, angleB) {
    //计算右肘比右肩的高度差
    var elbowShoulderDiff = getHeightDifference(shoulderY, elbowY);
    //计算右腕右肘的高度差
    var wristElbowDiff = getHeightDifference(elbowY, wristY);
    //计算角度
    if (elbowShoulderDiff > 5 && wristElbowDiff > 5) {
        if (judgmentAngleRange(angleA, 120, 180)) {
            return true;
        }
    } else {
        return false;
    }

}

/**
 * 调用ajax方法
 */
function callAjax(datatype) {
    // $.ajax({
    //     contentType: "application/json",
    //     // url: "http://192.168.20.175:28053/tensorflow/posture-event",
    //     // url: "http://192.168.10.57:28053/tensorflow/posture-event",
    //     url: "http://192.168.20.237:28053/tensorflow/posture-event",
    //     type: "get",
    //     // dataType: 'jsonp',
    //     async: false,
    //     dataType: "json",
    //     data: {
    //         "type": datatype
    //     },
    //     success: function (res) {
    //         console.log(res);
    //     },
    //     error: function (XMLHttpRequest, textStatus, errorThrown) {
    //     }
    // });
}

/**
 * 判断大于Judgment GreaterThan
 */
function judgmentAngleGreaterThan(angle, val) {
    if (angle > val) {
        return true;
    } else {
        return false;
    }
}

/**
 * 判断小于
 */
function judgmentAngleLessThan(angle, val) {
    if (angle < val) {
        return true;
    } else {
        return false;
    }
}

/**
 * 判断角度在min-max之间
 */
function judgmentAngleRange(angle, min, max) {
    if (min < angle && angle < max) {
        return true;
    } else {
        return false;
    }
}

/**
 * 求角度封装方法
 */
function angleCalculation(x1, y1, x2, y2, x3, y3) {
    var horizontalDistance = distanceBetweenTwoPoints(x1, y1, x2, y2);
    var verticalDistance = distanceBetweenTwoPoints(x2, y2, x3, y3);
    var ElbowHipDis = distanceBetweenTwoPoints(x1, y1, x3, y3);
    //余弦定理 Cosine theorem https://blog.csdn.net/zhang1244j/article/details/55053184
    var cosA = cosineTheorem(horizontalDistance, verticalDistance, ElbowHipDis);
    //余弦转角度
    var angleA = cosineToAngle(cosA);
    return angleA;
}

/**
 y轴的差值
 */
function getHeightDifference(y1, y2) {
    return y1 - y2;
}

/**
 * 勾股定理
 */
function distanceBetweenTwoPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

/**
 * 余弦定理Cosine theorem
 */
function cosineTheorem(AB, AC, BC) {
    return (Math.pow(AB, 2) + Math.pow(AC, 2) - Math.pow(BC, 2)) / (2 * AB * AC);
}

/**
 * 余弦转角度
 */
function cosineToAngle(cosA) {
    return Math.round(Math.acos(cosA) * 180 / Math.PI);
}

/**
 *  字段初始化
 */
function initVal(poses) {
    //判断是否有人进去区域
    //var isInTheArea = inTheArea(leftHipX, rightshoulderY, rightshoulderX, leftHipY, xpoint1, ypoint1, xpoint2, ypoint2);
    var i;
    var isInTheArea;
    for (i = 0; i < poses.length; i++) {
        isInTheArea = inTheArea(
            poses[i].keypoints[11].position.x,
            poses[i].keypoints[6].position.y,
            poses[i].keypoints[6].position.x,
            poses[i].keypoints[11].position.y,
            xpoint1, ypoint1, xpoint2, ypoint2);
        if (isInTheArea) {
            break;
        }
    }
    //把该人的参数返回
    if (isInTheArea){
        rightshoulderY = poses[i].keypoints[6].position.y;//6右肩
        rightshoulderX = poses[i].keypoints[6].position.x;
        rightElbowX = poses[i].keypoints[8].position.x;//8右肘
        rightElbowY = poses[i].keypoints[8].position.y;
        rightWristY = poses[i].keypoints[10].position.y;//10右腕
        rightWristX = poses[i].keypoints[10].position.x;
        leftshoulderX = poses[i].keypoints[5].position.x;
        leftshoulderY = poses[i].keypoints[5].position.y;//5左肩
        leftElbowX = poses[i].keypoints[7].position.x;//7左肘
        leftElbowY = poses[i].keypoints[7].position.y;
        leftWristX = poses[i].keypoints[9].position.x;
        leftWristY = poses[i].keypoints[9].position.y;//9左腕
        leftAnkleX = poses[i].keypoints[15].position.x//15左脚踝X
        leftAnkleY = poses[i].keypoints[15].position.x//15左脚踝Y
        rightKneeX = poses[i].keypoints[14].position.x;//14右膝X
        rightKneeY = poses[i].keypoints[14].position.y;//14右膝Y
        rightAnkleX = poses[i].keypoints[16].position.x;//16右脚踝X
        rightAnkleY = poses[i].keypoints[16].position.y;//16右脚踝Y
        leftKneeX = poses[i].keypoints[13].position.x//13左膝X
        leftKneeY = poses[i].keypoints[13].position.y//13左膝Y
        leftHipX = poses[i].keypoints[11].position.x;//11左髋X
        leftHipY = poses[i].keypoints[11].position.y;//11左髋Y
        rightHipX = poses[i].keypoints[12].position.x;//12右髋X
        rightHipY = poses[i].keypoints[12].position.y;//12右髋Y
    }
    return isInTheArea;



    // rightshoulderY = poses[0].keypoints[6].position.y;//6右肩
    // rightshoulderX = poses[0].keypoints[6].position.x;
    // rightElbowX = poses[0].keypoints[8].position.x;//8右肘
    // rightElbowY = poses[0].keypoints[8].position.y;
    // rightWristY = poses[0].keypoints[10].position.y;//10右腕
    // rightWristX = poses[0].keypoints[10].position.x;
    // leftshoulderX = poses[0].keypoints[5].position.x;
    // leftshoulderY = poses[0].keypoints[5].position.y;//5左肩
    // leftElbowX = poses[0].keypoints[7].position.x;//7左肘
    // leftElbowY = poses[0].keypoints[7].position.y;
    // leftWristX = poses[0].keypoints[9].position.x;
    // leftWristY = poses[0].keypoints[9].position.y;//9左腕
    // leftAnkleX = poses[0].keypoints[15].position.x//15左脚踝X
    // leftAnkleY = poses[0].keypoints[15].position.x//15左脚踝Y
    // rightKneeX = poses[0].keypoints[14].position.x;//14右膝X
    // rightKneeY = poses[0].keypoints[14].position.y;//14右膝Y
    // rightAnkleX = poses[0].keypoints[16].position.x;//16右脚踝X
    // rightAnkleY = poses[0].keypoints[16].position.y;//16右脚踝Y
    // leftKneeX = poses[0].keypoints[13].position.x//13左膝X
    // leftKneeY = poses[0].keypoints[13].position.y//13左膝Y
    // leftHipX = poses[0].keypoints[11].position.x;//11左髋X
    // leftHipY = poses[0].keypoints[11].position.y;//11左髋Y
    // rightHipX = poses[0].keypoints[12].position.x;//12右髋X
    // rightHipY = poses[0].keypoints[12].position.y;//12右髋Y
}

//关键点
function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
    for (let i = 5; i < keypoints.length; i++) {
        const keypoint = keypoints[i];
        if (keypoint.score < minConfidence) {
            continue;
        }
        const {y, x} = keypoint.position;
        drawPoint(ctx, x * scale, y * scale, 3, color);
    }
}

//骨骼线
function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);
    adjacentKeyPoints.forEach((keypoints) => {
        drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), color, scale, ctx);
    });
}

function drawPoint(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function toTuple({y, x}) {
    return [y, x];
}

function getHeightDifference(y1, y2) {
    return y1 - y2;
}

bindPage();
