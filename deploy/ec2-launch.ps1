param()
# One-click EC2 launch for Maq-Styler ecommerce (Sydney region, free tier)
# Prereq: aws configure done + ec2 full access IAM user. Run in PowerShell.

$ErrorActionPreference = "Stop"
$REGION = "ap-southeast-2"
$AMI = "ami-033bcb92ad88967d2"   # Ubuntu 22.04 LTS (x86_64, gp2) 2026-07-31
$KEY  = "ecommerce-key"
$SG   = "ecommerce-sg"
$NAME = "ecommerce"

Write-Host "==> [1/6] Keypair" -ForegroundColor Cyan
aws ec2 delete-key-pair --region $REGION --key-name $KEY 2>$null
$k = aws ec2 create-key-pair --region $REGION --key-name $KEY --query "KeyMaterial" --output text
Set-Content -Path "$PWD\$KEY.pem" -Value $k -NoNewline
# Secure the pem on Windows (owner read/execute only)
icacls "$PWD\$KEY.pem" /inheritance:r /grant:r "$($env:USERNAME):R" | Out-Null
Write-Host "   saved $PWD\$KEY.pem" -ForegroundColor Green

Write-Host "==> [2/6] Security group"
$sgId = aws ec2 create-security-group --group-name $SG --description "Maq-Styler ecom" --region $REGION --query "GroupId" --output text
aws ec2 authorize-security-group-ingress --group-id $sgId --ip-permissions "IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=0.0.0.0/0,Description=SSH}]" "IpProtocol=tcp,FromPort=5173,ToPort=5173,IpRanges=[{CidrIp=0.0.0.0/0,Description=Frontend}]" "IpProtocol=tcp,FromPort=5001,ToPort=5001,IpRanges=[{CidrIp=0.0.0.0/0,Description=Backend}]" --region $REGION | Out-Null
Write-Host "   sg $sgId ok" -ForegroundColor Green

Write-Host "==> [3/6] Launch t2.micro (free tier)" -ForegroundColor Cyan
$inst = aws ec2 run-instances --image-id $AMI --instance-type t2.micro --key-name $KEY --security-group-ids $sgId --block-device-mappings "[{`"DeviceName`":`"/dev/sda1`",`"Ebs`":{`"VolumeSize`":8,`"VolumeType`":`"gp3`"}}]" --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$NAME}]" --region $REGION --query "Instances[0].InstanceId" --output text
Write-Host "   instance $inst" -ForegroundColor Green

Write-Host "==> [4/6] Waiting for running + status ok" -ForegroundColor Cyan
aws ec2 wait instance-running --instance-ids $inst --region $REGION
aws ec2 wait instance-status-ok --instance-ids $inst --region $REGION
Write-Host "  running" -ForegroundColor Green

Write-Host "==> [5/6] Allocate + associate Elastic IP" -ForegroundColor Cyan
$eip = aws ec2 allocate-address --domain vpc --region $REGION --query "AllocationId" --output text
aws ec2 associate-address --instance-id $inst --allocation-id $eip --region $REGION | Out-Null
$publicIp = (aws ec2 describe-addresses --allocation-ids $eip --region $REGION --query "Addresses[0].PublicIp" --output text)
Write-Host "  EIP $publicIp" -ForegroundColor Green

Write-Host "==> [6/6] Info" -ForegroundColor Cyan
Write-Host "INSTANCE_ID = $inst"
Write-Host "ELASTIC_IP  = $publicIp"
Write-Host ""
Write-Host "SSH IN:  ssh -i `"$PWD\$KEY.pem`" ubuntu@$publicIp"
Write-Host "SG ID:   $sgId"